import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../helpers/renderWithTheme'
import type { Agent, ProviderConfig, User } from '@/lib/types'

vi.mock('@/lib/api', () => ({
  api: {
    getProvider: vi.fn(),
    setProvider: vi.fn(),
    listAgents: vi.fn(),
    createAgent: vi.fn(),
    revokeAgent: vi.fn(),
  },
}))

import { api } from '@/lib/api'
import { AccountPanel } from '@/components/AccountPanel'

const user: User = { id: 'u1', email: 'me@example.com', name: 'Diego', avatarUrl: null, plan: 'free' }

const agent: Agent = {
  id: 'a1', name: 'prod-vm', tokenPrefix: 'mag_1a2b3c',
  status: 'offline', lastSeenAt: null, createdAt: new Date().toISOString(), revokedAt: null,
}

function mockProvider(kind: ProviderConfig['kind']) {
  ;(api.getProvider as ReturnType<typeof vi.fn>).mockResolvedValue({ kind, updatedAt: null })
}

function render(open = true) {
  const onOpenChange = vi.fn()
  renderWithTheme(<AccountPanel open={open} onOpenChange={onOpenChange} user={user} />)
  return { onOpenChange }
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(api.listAgents as ReturnType<typeof vi.fn>).mockResolvedValue([])
  mockProvider('cloud-managed')
})

describe('AccountPanel', () => {
  it('loads the current provider and marks it selected', async () => {
    render()
    const cloud = await screen.findByRole('button', { name: /Cloud Managed/ })
    expect(cloud).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Self-Hosted VM/ })).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(cloud)
    expect(api.setProvider).not.toHaveBeenCalled()
  })

  it('does not fetch while closed', () => {
    render(false)
    expect(api.getProvider).not.toHaveBeenCalled()
  })

  it('switches the provider and reveals the agents section', async () => {
    ;(api.setProvider as ReturnType<typeof vi.fn>).mockResolvedValue({ kind: 'self-hosted-vm', updatedAt: null })
    render()

    await userEvent.click(await screen.findByRole('button', { name: /Self-Hosted VM/ }))

    expect(api.setProvider).toHaveBeenCalledWith('self-hosted-vm')
    await screen.findByText('Agents')
  })

  it('ignores clicks on a coming-soon provider', async () => {
    render()
    const aws = await screen.findByRole('button', { name: /self-hosted-aws/ })
    expect(aws).toBeDisabled()
    await userEvent.click(aws)
    expect(api.setProvider).not.toHaveBeenCalled()
  })

  it('lists existing agents with status', async () => {
    mockProvider('self-hosted-vm')
    ;(api.listAgents as ReturnType<typeof vi.fn>).mockResolvedValue([agent])
    render()

    await screen.findByText('prod-vm')
    expect(screen.getByText('mag_1a2b3c…')).toBeInTheDocument()
    expect(screen.getByText('never connected')).toBeInTheDocument()
  })

  it('creates an agent and shows the token once', async () => {
    mockProvider('self-hosted-vm')
    ;(api.createAgent as ReturnType<typeof vi.fn>).mockResolvedValue({ ...agent, token: 'mag_secret_full_token' })
    render()

    await userEvent.click(await screen.findByRole('button', { name: 'New agent' }))
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await userEvent.click(screen.getByRole('button', { name: 'New agent' }))
    await userEvent.type(screen.getByPlaceholderText('Agent name'), 'laptop')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(api.createAgent).toHaveBeenCalledWith('laptop')
    await screen.findByText('mag_secret_full_token')
    expect(screen.getByText(/shown only once/)).toBeInTheDocument()
  })

  it('revokes an agent', async () => {
    mockProvider('self-hosted-vm')
    ;(api.listAgents as ReturnType<typeof vi.fn>).mockResolvedValue([agent])
    ;(api.revokeAgent as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    render()

    await screen.findByText('prod-vm')
    await userEvent.click(screen.getByRole('button', { name: 'Revoke' }))
    expect(api.revokeAgent).toHaveBeenCalledWith('a1')
  })

  it('shows the profile tab', async () => {
    render()
    await userEvent.click(screen.getByRole('tab', { name: 'Profile' }))
    expect(screen.getByText('me@example.com')).toBeInTheDocument()
    expect(screen.getByText('Diego')).toBeInTheDocument()
  })

  it('closes via the close button', async () => {
    const { onOpenChange } = render()
    await screen.findByRole('button', { name: /Cloud Managed/ })
    fireEvent.click(screen.getByLabelText('Close panel'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('hides the agents section for a non-VM provider', async () => {
    render()
    await screen.findByRole('button', { name: /Cloud Managed/ })
    expect(screen.queryByText('Agents')).not.toBeInTheDocument()
  })

  it('renders online and revoked agent states', async () => {
    mockProvider('self-hosted-vm')
    ;(api.listAgents as ReturnType<typeof vi.fn>).mockResolvedValue([
      { ...agent, id: 'a2', name: 'live-vm', status: 'online' },
      { ...agent, id: 'a3', name: 'old-vm', revokedAt: new Date().toISOString() },
      { ...agent, id: 'a4', name: 'seen-vm', lastSeenAt: new Date(Date.now() - 120000).toISOString() },
    ])
    render()

    await screen.findByText('live-vm')
    expect(screen.getByText('online')).toBeInTheDocument()
    expect(screen.getByText('revoked')).toBeInTheDocument()
    expect(screen.getByText(/offline · 2m ago/)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Revoke' })).toHaveLength(2)
  })

  it('copies the fresh token to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    mockProvider('self-hosted-vm')
    ;(api.createAgent as ReturnType<typeof vi.fn>).mockResolvedValue({ ...agent, token: 'mag_copy_me' })
    render()

    await userEvent.click(await screen.findByRole('button', { name: 'New agent' }))
    await userEvent.type(screen.getByPlaceholderText('Agent name'), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    await screen.findByText('mag_copy_me')
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }))

    expect(writeText).toHaveBeenCalledWith('mag_copy_me')
    await screen.findByText('Copied')
  })

  it('reloads the provider when the switch fails', async () => {
    ;(api.setProvider as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('nope'))
    render()

    await userEvent.click(await screen.findByRole('button', { name: /Self-Hosted VM/ }))
    await waitFor(() => expect(api.getProvider).toHaveBeenCalledTimes(2))
  })
})
