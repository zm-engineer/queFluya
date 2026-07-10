// Shared WebRTC pieces for the 1:1 tandem voice call (Conectar, Phase 3).
//
// The heavy lifting (RTCPeerConnection, media, ICE) lives in the
// `useWebRTCAudio` hook — it needs the browser. This module holds the parts
// that are pure and worth pinning down: the ICE server list, the signaling
// message shape, the channel name, and who makes the first offer.
//
// Signaling rides the SAME Supabase Realtime infrastructure the chat uses, on a
// dedicated broadcast channel per session — so voice adds $0 of new backend.

/**
 * STUN only for now: free public servers that just help each peer discover its
 * public address for NAT traversal. ~80-90% of connections work with STUN alone
 * (direct peer-to-peer, no media ever touches a server). The remaining
 * restrictive NATs need a TURN relay — deferred until it actually bites in
 * testing across real networks (Cloudflare Realtime / metered.ca / self-hosted
 * coturn). Add TURN entries here when that day comes.
 */
export const ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
]

/** Broadcast channel that carries the offer/answer/ICE handshake for a session. */
export function signalingChannelName(sessionId: string): string {
  return `tandem:${sessionId}:rtc`
}

/**
 * Exactly one peer must create the offer, or the two offers collide ("glare").
 * We pick deterministically: the session host is the offerer, the joiner
 * answers. Both peers know `hostProfileId` (it's on the session row), so they
 * agree without any extra negotiation.
 */
export function isOfferer(profileId: string, hostProfileId: string): boolean {
  return profileId === hostProfileId
}

/** Messages exchanged over the signaling channel. `from` lets peers ignore echoes. */
export type SignalMessage =
  | { kind: 'ready'; from: string }
  | { kind: 'offer'; from: string; sdp: RTCSessionDescriptionInit }
  | { kind: 'answer'; from: string; sdp: RTCSessionDescriptionInit }
  | { kind: 'ice'; from: string; candidate: RTCIceCandidateInit }
