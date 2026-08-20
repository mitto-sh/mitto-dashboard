import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithTheme } from '../helpers/renderWithTheme'
import { ProjectDetailPanel } from '@/components/ProjectDetailPanel'
import type { Project } from '@/lib/types'

vi.mock('@/lib/api', () => ({
  api: {
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}))

import { api } from '@/lib/api'

const project: Project = {
  id: 'p1', name: 'api-gateway', slug: 'api-gateway', region: 'us-east-1',
  isPrivate: true, enabled: true, createdAt: new Date().toISOString(),
}

function setup(tab: 'overview' | 'settings' = 'settings', overrides: Partial<Project> = {}) {
  const onTabChange = vi.fn()
  const onClose = vi.fn()
  const onProjectUpdated = vi.fn()
  const onDeleted = vi.fn()
  renderWithTheme(
    <ProjectDetailPanel
      project={{ ...project, ...overrides }}
      open
      tab={tab}
      onTabChange={onTabChange}
      onClose={onClose}
      onProjectUpdated={onProjectUpdated}
      onDeleted={onDeleted}
    />,
  )
  return { onTabChange, onClose, onProjectUpdated, onDeleted }
}

describe('ProjectDetailPanel', () => {
  beforeEach(() => {
    vi.mocked(api.updateProject).mockResolvedValue(project)
    vi.mocked(api.deleteProject).mockResolvedValue(undefined)
  })

  it('shows the domain summary on the Overview tab', () => {
    setup('overview')
    expect(screen.getByText('api-gateway.mitto.app')).toBeInTheDocument()
  })

  it('prefills the rename form and visibility toggles from the project', () => {
    setup('settings')
    expect(screen.getByDisplayValue('api-gateway')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle private')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByLabelText('Toggle enabled')).toHaveAttribute('aria-checked', 'true')
  })

  it('saves a rename and visibility changes', async () => {
    setup('settings')
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'storefront' } })
    fireEvent.click(screen.getByLabelText('Toggle private'))
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(api.updateProject).toHaveBeenCalledWith('p1', { name: 'storefront', isPrivate: false, enabled: true })
    })
  })

  it('blocks save and shows an error for an empty name', () => {
    setup('settings')
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(api.updateProject).not.toHaveBeenCalled()
    expect(screen.getByText(/required|invalid/i)).toBeInTheDocument()
  })

  it('shows a save error message when the API call fails', async () => {
    vi.mocked(api.updateProject).mockRejectedValue(new Error('Name already taken'))
    setup('settings')
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Name already taken')).toBeInTheDocument()
  })

  it('opens the delete confirmation and deletes the project', async () => {
    const { onDeleted } = setup('settings')
    fireEvent.click(screen.getByRole('button', { name: 'Delete project' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(api.deleteProject).toHaveBeenCalledWith('p1')
      expect(onDeleted).toHaveBeenCalled()
    })
  })
})
