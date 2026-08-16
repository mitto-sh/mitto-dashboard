import { describe, it, expect } from 'vitest'
import { statusLabel, isPulsing } from '@/lib/status'

describe('status helpers', () => {
  it('returns the status word, or "no deploys" when unset', () => {
    expect(statusLabel('live')).toBe('live')
    expect(statusLabel(null)).toBe('no deploys')
    expect(statusLabel(undefined)).toBe('no deploys')
  })

  it('flags building/pushing/provisioning as pulsing, everything else as not', () => {
    expect(isPulsing('building')).toBe(true)
    expect(isPulsing('pushing')).toBe(true)
    expect(isPulsing('provisioning')).toBe(true)
    expect(isPulsing('live')).toBe(false)
    expect(isPulsing('failed')).toBe(false)
    expect(isPulsing(null)).toBe(false)
  })
})
