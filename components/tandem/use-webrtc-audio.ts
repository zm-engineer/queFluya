'use client'

import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import {
  ICE_SERVERS,
  signalingChannelName,
  type SignalMessage,
} from '@/lib/webrtc'

export type VoiceStatus = 'off' | 'connecting' | 'connected' | 'failed'

type Options = {
  supabase: SupabaseClient
  sessionId: string
  profileId: string
  /** True for the peer that creates the offer (the session host). See isOfferer. */
  isOfferer: boolean
  /** Flip to true to start the call (mic permission + connect), false to hang up. */
  enabled: boolean
}

type Result = {
  status: VoiceStatus
  muted: boolean
  toggleMute: () => void
  /** The partner's audio, to feed an <audio> element. */
  remoteStream: MediaStream | null
  /** Human-friendly reason when status is 'failed' (e.g. mic denied). */
  error: string | null
}

/**
 * Peer-to-peer voice for an active tandem. Signaling (offer/answer/ICE) rides a
 * dedicated Supabase broadcast channel; the audio itself flows directly between
 * the two browsers. One side (the offerer) drives negotiation; both announce
 * "ready" on subscribe so whoever connects last kicks off the offer — no lost
 * handshake regardless of who pressed "Activar voz" first.
 */
export function useWebRTCAudio({
  supabase,
  sessionId,
  profileId,
  isOfferer,
  enabled,
}: Options): Result {
  const [status, setStatus] = useState<VoiceStatus>('off')
  const [muted, setMuted] = useState(false)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)

  function toggleMute() {
    const stream = localStreamRef.current
    if (!stream) return
    const next = !mutedRef.current
    stream.getAudioTracks().forEach((t) => (t.enabled = !next))
    mutedRef.current = next
    setMuted(next)
  }
  // Keep the latest muted value reachable from toggleMute without re-creating it.
  const mutedRef = useRef(false)

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

      // 1. Mic permission + local audio. A denial ends here with a clear status.
      let localStream: MediaStream
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch {
        if (cancelled) return
        setError('No pudimos acceder al micrófono. Revisa los permisos del navegador.')
        setStatus('failed')
        return
      }
      if (cancelled) {
        localStream.getTracks().forEach((t) => t.stop())
        return
      }
      localStreamRef.current = localStream
      mutedRef.current = false
      setMuted(false)

      // 2. Peer connection with the local mic added.
      pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
      localStream.getTracks().forEach((t) => pc!.addTrack(t, localStream))

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
      setRemoteStream(null)
      setStatus('off')
    }
  }, [supabase, sessionId, profileId, isOfferer, enabled])

  return { status, muted, toggleMute, remoteStream, error }
}
