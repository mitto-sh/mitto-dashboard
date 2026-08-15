import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

let searchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams,
}))

describe('LoginPage', () => {
  it('renders the GitHub sign-in link with no error by default', async () => {
    searchParams = new URLSearchParams()
    const { default: LoginPage } = await import('@/app/login/page')
    render(<LoginPage />)

    expect(screen.getByRole('link', { name: 'Sign in with GitHub' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a friendly message for a known error code', async () => {
    searchParams = new URLSearchParams('error=no_verified_email')
    const { default: LoginPage } = await import('@/app/login/page')
    render(<LoginPage />)

    expect(screen.getByRole('alert')).toHaveTextContent('verified primary email')
  })

  it('shows a generic message for an unknown error code', async () => {
    searchParams = new URLSearchParams('error=something_weird')
    const { default: LoginPage } = await import('@/app/login/page')
    render(<LoginPage />)

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
  })
})
