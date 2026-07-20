'use client'

import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import {
  ICE_SERVERS,
  signalingChannelName,
  type SignalMessage,
} from '@/lib/webrtc'

export type CallStatus = 'off' | 'connecting' | 'connected' | 'failed'

const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
}

type Options = {
  supabase: SupabaseClient
  sessionId: string
  profileId: string
  /** True for the peer that creates the offer (the session host). See isOfferer. */
  isOfferer: boolean
  /** Flip to true to start the call (camera/mic permission + connect), false to hang up. */
  enabled: boolean
}

type Result = {
  status: CallStatus
  micMuted: boolean
  toggleMic: () => void
  cameraOff: boolean
  toggleCamera: () => void
  /** False when we fell back to audio-only (camera denied/absent). */
  hasVideo: boolean
  /** Your own stream, for the local preview <video>. */
  localStream: MediaStream | null
  /** The partner's stream (audio + video), for the main <video>. */
  remoteStream: MediaStream | null
  /** Human-friendly reason when status is 'failed' (e.g. mic denied). */
  error: string | null
}

/**
 * Peer-to-peer video call for an active tandem. Signaling (offer/answer/ICE)
 * rides a dedicated Supabase broadcast channel; the audio+video flows directly
 * between the two browsers. One side (the offerer) drives negotiation; both
 * announce "ready" on subscribe so whoever connects last kicks off the offer.
 *
 * Audio and video share one RTCPeerConnection, so adding video over the earlier
 * audio-only version needed no signaling changes — just camera capture + extra
 * <video> elements. If the camera is denied we fall back to audio-only so the
 * call still works.
 */
export function useWebRTCCall({
  supabase,
  sessionId,
  profileId,
  isOfferer,
  enabled,
}: Options): Result {
  const [status, setStatus] = useState<CallStatus>('off')
  const [micMuted, setMicMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [hasVideo, setHasVideo] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  // Latest toggle values reachable from the handlers without re-creating them.
  const micMutedRef = useRef(false)
  const cameraOffRef = useRef(false)

  function toggleMic() {
    const stream = localStreamRef.current
    if (!stream) return
    const next = !micMutedRef.current
    stream.getAudioTracks().forEach((t) => (t.enabled = !next))
    micMutedRef.current = next
    setMicMuted(next)
  }

  function toggleCamera() {
    const stream = localStreamRef.current
    if (!stream || stream.getVideoTracks().length === 0) return
    const next = !cameraOffRef.current
    stream.getVideoTracks().forEach((t) => (t.enabled = !next))
    cameraOffRef.current = next
    setCameraOff(next)
  }

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    let pc: RTCPeerConnection | null = null
    let channel: RealtimeChannel | null = null
    let negotiationStarted = false
    let repliedReady = false
    // ICE candidates can arrive before the remote description is set; buffer them.
    const pendingIce: RTCIceCandidateInit[] = []

    const send = (msg: SignalMessage) => {
      channel?.send({ type: 'broadcast', event: 'signal', payload: msg })
    }

    const flushIce = async () => {
      while (pendingIce.length) {
        const c = pendingIce.shift()!
        try {
          await pc?.addIceCandidate(c)
        } catch {
          /* a late/duplicate candidate is harmless */
        }
      }
    }

    const makeOffer = async () => {
      if (!pc || negotiationStarted) return
      negotiationStarted = true
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      send({ kind: 'offer', from: profileId, sdp: offer })
    }

    const handleSignal = async (msg: SignalMessage) => {
      if (msg.from === profileId || !pc) return

      if (msg.kind === 'ready') {
        if (isOfferer) {
          makeOffer()
        } else if (!repliedReady) {
          // We may have subscribed first and been missed; re-announce so the
          // offerer definitely hears us and starts the offer.
          repliedReady = true
          send({ kind: 'ready', from: profileId })
        }
        return
      }

      if (msg.kind === 'offer' && !isOfferer) {
        await pc.setRemoteDescription(msg.sdp)
        await flushIce()
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        send({ kind: 'answer', from: profileId, sdp: answer })
        return
      }

      if (msg.kind === 'answer' && isOfferer) {
        await pc.setRemoteDescription(msg.sdp)
        await flushIce()
        return
      }

      if (msg.kind === 'ice') {
        if (pc.remoteDescription) {
          try {
            await pc.addIceCandidate(msg.candidate)
          } catch {
            /* ignore */
          }
        } else {
          pendingIce.push(msg.candidate)
        }
      }
    }

    ;(async () => {
      setStatus('connecting')
      setError(null)

      // 1. Camera + mic. Prefer video; if the camera is denied or missing, fall
      //    back to audio-only so a call is still possible. Echo cancellation on
      //    the mic keeps speakers usable.
      let stream: MediaStream
      let gotVideo = false
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: AUDIO_CONSTRAINTS,
        })
        gotVideo = stream.getVideoTracks().length > 0
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO_CONSTRAINTS })
        } catch {
          if (cancelled) return
          setError('No pudimos acceder a la cámara ni al micrófono. Revisa los permisos del navegador.')
          setStatus('failed')
          return
        }
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      localStreamRef.current = stream
      micMutedRef.current = false
      cameraOffRef.current = false
      setMicMuted(false)
      setCameraOff(false)
      setHasVideo(gotVideo)
      setLocalStream(stream)

      // 2. Peer connection with the local tracks added (audio + video share it).
      pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
      stream.getTracks().forEach((t) => pc!.addTrack(t, stream))

      pc.ontrack = (e) => {
        if (!cancelled) setRemoteStream(e.streams[0] ?? new MediaStream([e.track]))
      }
      pc.onicecandidate = (e) => {
        if (e.candidate) send({ kind: 'ice', from: profileId, candidate: e.candidate.toJSON() })
      }
      pc.onconnectionstatechange = () => {
        if (cancelled || !pc) return
        if (pc.connectionState === 'connected') setStatus('connected')
        else if (pc.connectionState === 'failed') setStatus('failed')
      }

      // 3. Signaling channel. Broadcast doesn't echo to the sender by default,
      //    so we never receive our own messages.
      const { data } = await supabase.auth.getSession()
      await supabase.realtime.setAuth(data.session?.access_token ?? null)
      if (cancelled) return

      channel = supabase.channel(signalingChannelName(sessionId))
      channel
        .on('broadcast', { event: 'signal' }, ({ payload }) => {
          handleSignal(payload as SignalMessage)
        })
        .subscribe((s) => {
          // Announce readiness once live; the offerer starts the offer when it
          // hears the peer, so both must be subscribed first.
          if (s === 'SUBSCRIBED') send({ kind: 'ready', from: profileId })
        })
    })()

    return () => {
      cancelled = true
      if (pc) {
        pc.ontrack = null
        pc.onicecandidate = null
        pc.onconnectionstatechange = null
        pc.close()
      }
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
      if (channel) supabase.removeChannel(channel)
      setLocalStream(null)
      setRemoteStream(null)
      setStatus('off')
    }
  }, [supabase, sessionId, profileId, isOfferer, enabled])

  return {
    status,
    micMuted,
    toggleMic,
    cameraOff,
    toggleCamera,
    hasVideo,
    localStream,
    remoteStream,
    error,
  }
}
