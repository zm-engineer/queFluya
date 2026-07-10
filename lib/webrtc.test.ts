import { describe, expect, it } from 'vitest'
import { isOfferer, signalingChannelName } from './webrtc'

describe('isOfferer', () => {
  it('makes the host the offerer and the joiner the answerer', () => {
    const host = 'host-uuid'
    const joiner = 'joiner-uuid'
    expect(isOfferer(host, host)).toBe(true)
    expect(isOfferer(joiner, host)).toBe(false)
  })
})

describe('signalingChannelName', () => {
  it('is distinct from the chat channel so voice and chat do not clash', () => {
    expect(signalingChannelName('abc')).toBe('tandem:abc:rtc')
    expect(signalingChannelName('abc')).not.toBe('tandem:abc')
  })
})
