import { describe, it, expect } from 'vitest'
import { getToken, setToken, clearToken, isAuthenticated } from '@/lib/auth'

describe('auth token storage', () => {
  it('returns null when no token is stored', () => {
    expect(getToken()).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })

  it('stores and retrieves a token', () => {
    setToken('abc.def.ghi')
    expect(getToken()).toBe('abc.def.ghi')
    expect(isAuthenticated()).toBe(true)
  })

  it('clears a stored token', () => {
    setToken('abc.def.ghi')
    clearToken()
    expect(getToken()).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })
})
