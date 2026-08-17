import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithTheme } from '../helpers/renderWithTheme'
import { setToken } from '@/lib/auth'
import type { Project } from '@/lib/types'

const routerPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush }),
  useParams: () => ({ id: 'p1' }),
}))

vi.mock('@/lib/api', () => ({
  api: {
    getProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}))

import { api } from '@/lib/api'

const project: Project = {
  id: 'p1', name: 'My App', slug: 'my-app', region: 'us-east-1',
  isPrivate: true, enabled: true, createdAt: new Date().toISOString(),
}

describe('ProjectSettingsPage', () => {
  beforeEach(() => {
    setToken('a-token')
    routerPush.mockClear()
    vi.mocked(api.getProject).mockResolvedValue(project)
  })

  it('pre-fills the form with the current project values', async () => {
    const { default: SettingsPage } = await import('@/app/projects/[id]/settings/page')
    renderWithTheme(<SettingsPage />)

    expect(await screen.findByDisplayValue('My App')).toBeInTheDocument()
    expect(screen.getByLabelText('Private')).toBeChecked()
    expect(screen.getByLabelText('Enabled')).toBeChecked()
  })

  it('saves a rename and flag changes', async () => {
    const updated: Project = { ...project, name: 'Renamed', slug: 'renamed', isPrivate: false, enabled: false }
    vi.mocked(api.updateProject).mockResolvedValue(updated)

    const { default: SettingsPage } = await import('@/app/projects/[id]/settings/page')
    renderWithTheme(<SettingsPage />)

    await screen.findByDisplayValue('My App')
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Renamed' } })
    fireEvent.click(screen.getByLabelText('Private'))
    fireEvent.click(screen.getByLabelText('Enabled'))
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(api.updateProject).toHaveBeenCalledWith('p1', { name: 'Renamed', isPrivate: false, enabled: false })
    })
    expect(await screen.findByText(/renamed/)).toBeInTheDocument()
  })

  it('shows a validation error for an empty name', async () => {
    const { default: SettingsPage } = await import('@/app/projects/[id]/settings/page')
    renderWithTheme(<SettingsPage />)

    await screen.findByDisplayValue('My App')
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(api.updateProject).not.toHaveBeenCalled()
  })

  it('shows a hint when disabling', async () => {
    const { default: SettingsPage } = await import('@/app/projects/[id]/settings/page')
    renderWithTheme(<SettingsPage />)

    await screen.findByDisplayValue('My App')
    fireEvent.click(screen.getByLabelText('Enabled'))

    expect(screen.getByText(/new deployments will be blocked/)).toBeInTheDocument()
  })

  it('shows a save error message on failure', async () => {
    vi.mocked(api.updateProject).mockRejectedValue(new Error('conflict'))
    const { default: SettingsPage } = await import('@/app/projects/[id]/settings/page')
    renderWithTheme(<SettingsPage />)

    await screen.findByDisplayValue('My App')
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('conflict')).toBeInTheDocument()
  })

  it('has a back link to the project canvas', async () => {
    const { default: SettingsPage } = await import('@/app/projects/[id]/settings/page')
    renderWithTheme(<SettingsPage />)

    await screen.findByDisplayValue('My App')
    expect(screen.getByText('Back to project').closest('a')).toHaveAttribute('href', '/projects/p1')
  })

  it('deletes the project via the danger zone and navigates to /projects', async () => {
    vi.mocked(api.deleteProject).mockResolvedValue(undefined)
    const { default: SettingsPage } = await import('@/app/projects/[id]/settings/page')
    renderWithTheme(<SettingsPage />)

    await screen.findByDisplayValue('My App')
    fireEvent.click(screen.getByRole('button', { name: 'Delete project' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith('/projects'))
  })
})
