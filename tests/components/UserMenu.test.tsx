import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../helpers/renderWithTheme'
import { UserMenu } from '@/components/UserMenu'
import { setToken, getToken } from '@/lib/auth'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/lib/api', () => ({
  api: {
    me: vi.fn(),
  },
}))

import { api } from '@/lib/api'

describe('UserMenu', () => {
  beforeEach(() => {
    vi.mocked(api.me).mockResolvedValue({ id: 'u1', email: 'ada@example.com', name: 'Ada Lovelace', avatarUrl: null, plan: 'free' })
  })

  it('shows the GitHub avatar image when one is available', async () => {
    vi.mocked(api.me).mockResolvedValue({ id: 'u1', email: 'ada@example.com', name: 'Ada Lovelace', avatarUrl: 'https://avatars.githubusercontent.com/u/1', plan: 'free' })
    renderWithTheme(<UserMenu />)

    const trigger = screen.getByLabelText('User menu')
    await waitFor(() => {
      expect(trigger.querySelector('img')).toHaveAttribute('src', 'https://avatars.githubusercontent.com/u/1')
    })
  })

  it('falls back to an initial when there is no avatar', async () => {
    renderWithTheme(<UserMenu />)
    expect(await screen.findByText('A')).toBeInTheDocument()
  })

  it('opens with Theme, Language and Sign out items', async () => {
    renderWithTheme(<UserMenu />)
    await userEvent.click(screen.getByLabelText('User menu'))

    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle language')).toBeInTheDocument()
    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })

  it('toggles the theme label when Theme is selected', async () => {
    renderWithTheme(<UserMenu />)
    await userEvent.click(screen.getByLabelText('User menu'))
    expect(screen.getByLabelText('Toggle theme')).toHaveTextContent('Light')

    await userEvent.click(screen.getByLabelText('Toggle theme'))
    await userEvent.click(screen.getByLabelText('User menu'))
    expect(screen.getByLabelText('Toggle theme')).toHaveTextContent('Dark')
  })

  it('toggles the language label when Language is selected', async () => {
    renderWithTheme(<UserMenu />)
    await userEvent.click(screen.getByLabelText('User menu'))
    expect(screen.getByLabelText('Toggle language')).toHaveTextContent('EN')

    await userEvent.click(screen.getByLabelText('Toggle language'))
    await userEvent.click(screen.getByLabelText('User menu'))
    expect(screen.getByLabelText('Toggle language')).toHaveTextContent('ES')
  })

  it('clears the token and redirects to /login on sign out', async () => {
    setToken('a-token')
    renderWithTheme(<UserMenu />)
    await userEvent.click(screen.getByLabelText('User menu'))
    await userEvent.click(screen.getByText('Sign out'))

    expect(getToken()).toBeNull()
    expect(push).toHaveBeenCalledWith('/login')
  })
})
