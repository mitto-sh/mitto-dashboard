import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { setToken } from '@/lib/auth'

const replace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

describe('Home page', () => {
  it('redirects to /login when unauthenticated', async () => {
    const { default: Home } = await import('@/app/page')
    render(<Home />)
    expect(replace).toHaveBeenCalledWith('/login')
  })

  it('redirects to /projects when authenticated', async () => {
    setToken('a-token')
    const { default: Home } = await import('@/app/page')
    render(<Home />)
    expect(replace).toHaveBeenCalledWith('/projects')
  })
})
