import { describe, it, expect } from 'vitest'
import { formatRelativeTime } from '@/lib/time'

describe('formatRelativeTime', () => {
  const now = new Date('2026-01-01T12:00:00Z')

  it('returns "just now" for very recent times', () => {
    expect(formatRelativeTime('2026-01-01T11:59:58Z', now)).toBe('just now')
  })

  it('returns seconds for under a minute', () => {
    expect(formatRelativeTime('2026-01-01T11:59:30Z', now)).toBe('30s ago')
  })

  it('returns minutes for under an hour', () => {
    expect(formatRelativeTime('2026-01-01T11:45:00Z', now)).toBe('15m ago')
  })

  it('returns hours for under a day', () => {
    expect(formatRelativeTime('2026-01-01T10:00:00Z', now)).toBe('2h ago')
  })

  it('returns days beyond a day', () => {
    expect(formatRelativeTime('2025-12-30T12:00:00Z', now)).toBe('2d ago')
  })
})
