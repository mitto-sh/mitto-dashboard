import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { getToken } from '@/lib/auth'

const replace = vi.fn()
let searchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}))

describe('AuthCallbackPage', () => {
  it('stores the token and redirects to /projects when present', async () => {
    searchParams = new URLSearchParams('token=my-jwt')
    const { default: AuthCallbackPage } = await import('@/app/auth/callback/page')
    render(<AuthCallbackPage />)

    expect(getToken()).toBe('my-jwt')
    expect(replace).toHaveBeenCalledWith('/projects')
  })

  it('redirects to /login with an error when no token is present', async () => {
    searchParams = new URLSearchParams()
    const { default: AuthCallbackPage } = await import('@/app/auth/callback/page')
    render(<AuthCallbackPage />)

    expect(replace).toHaveBeenCalledWith('/login?error=missing_code')
  })
})
