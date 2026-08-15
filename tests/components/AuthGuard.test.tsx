import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthGuard } from '@/components/AuthGuard'
import { setToken } from '@/lib/auth'

const replace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

describe('AuthGuard', () => {
  it('redirects to /login and renders nothing when unauthenticated', () => {
    render(<AuthGuard><p>secret content</p></AuthGuard>)

    expect(replace).toHaveBeenCalledWith('/login')
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    setToken('a-token')
    render(<AuthGuard><p>secret content</p></AuthGuard>)

    expect(screen.getByText('secret content')).toBeInTheDocument()
  })
})
