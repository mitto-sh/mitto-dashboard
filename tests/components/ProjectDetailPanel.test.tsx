import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithTheme } from '../helpers/renderWithTheme'
import { ProjectDetailPanel } from '@/components/ProjectDetailPanel'
import type { Project, Environment } from '@/lib/types'

vi.mock('@/lib/api', () => ({
  api: {
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    createEnvironment: vi.fn(),
    updateEnvironment: vi.fn(),
    deleteEnvironment: vi.fn(),
  },
}))

import { api } from '@/lib/api'

const project: Project = {
  id: 'p1', name: 'api-gateway', slug: 'api-gateway', region: 'us-east-1',
  isPrivate: true, enabled: true, createdAt: new Date().toISOString(),
}

const productionEnv: Environment = {
  id: 'env-1', projectId: 'p1', name: 'Production', slug: 'production', isDefault: true, createdAt: new Date().toISOString(),
}
const devEnv: Environment = {
  id: 'env-2', projectId: 'p1', name: 'Development', slug: 'development', isDefault: false, createdAt: new Date().toISOString(),
}

function setup(
  tab: 'overview' | 'settings' = 'settings',
  overrides: Partial<Project> = {},
  environments: Environment[] = [productionEnv, devEnv],
) {
  const onTabChange = vi.fn()
  const onClose = vi.fn()
  const onProjectUpdated = vi.fn()
  const onDeleted = vi.fn()
  const onEnvironmentCreated = vi.fn()
  const onEnvironmentUpdated = vi.fn()
  const onEnvironmentDeleted = vi.fn()
  renderWithTheme(
    <ProjectDetailPanel
      project={{ ...project, ...overrides }}
      open
      tab={tab}
      onTabChange={onTabChange}
      onClose={onClose}
      onProjectUpdated={onProjectUpdated}
      onDeleted={onDeleted}
      environments={environments}
      onEnvironmentCreated={onEnvironmentCreated}
      onEnvironmentUpdated={onEnvironmentUpdated}
      onEnvironmentDeleted={onEnvironmentDeleted}
    />,
  )
  return { onTabChange, onClose, onProjectUpdated, onDeleted, onEnvironmentCreated, onEnvironmentUpdated, onEnvironmentDeleted }
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

  it('lists environments and marks the default one', () => {
    setup('settings')
    expect(screen.getByText('Production')).toBeInTheDocument()
    expect(screen.getByText('Development')).toBeInTheDocument()
    expect(screen.getByText('default')).toBeInTheDocument()
  })

  it('renames an environment', async () => {
    const updated = { ...devEnv, name: 'Staging', slug: 'staging' }
    vi.mocked(api.updateEnvironment).mockResolvedValue(updated)
    const { onEnvironmentUpdated } = setup('settings')

    fireEvent.click(screen.getByText('Development'))
    const input = screen.getByDisplayValue('Development')
    fireEvent.change(input, { target: { value: 'Staging' } })
    fireEvent.click(screen.getByLabelText('Save environment name'))

    await waitFor(() => {
      expect(api.updateEnvironment).toHaveBeenCalledWith('env-2', { name: 'Staging' })
      expect(onEnvironmentUpdated).toHaveBeenCalledWith(updated)
    })
  })

  it('requires a second click to delete an environment', async () => {
    vi.mocked(api.deleteEnvironment).mockResolvedValue(undefined)
    const { onEnvironmentDeleted } = setup('settings')

    const removeButtons = screen.getAllByLabelText('Remove environment')
    fireEvent.click(removeButtons[1]!) // Development row

    expect(api.deleteEnvironment).not.toHaveBeenCalled()
    fireEvent.click(screen.getByLabelText('Delete?'))

    await waitFor(() => {
      expect(api.deleteEnvironment).toHaveBeenCalledWith('env-2')
      expect(onEnvironmentDeleted).toHaveBeenCalledWith('env-2')
    })
  })

  it('shows an error inline when deleting the default environment is rejected', async () => {
    vi.mocked(api.deleteEnvironment).mockRejectedValue(new Error('The default environment cannot be deleted'))
    setup('settings')

    const removeButtons = screen.getAllByLabelText('Remove environment')
    fireEvent.click(removeButtons[0]!) // Production row
    fireEvent.click(screen.getByLabelText('Delete?'))

    expect(await screen.findByText('The default environment cannot be deleted')).toBeInTheDocument()
  })

  it('opens the create-environment modal and creates one', async () => {
    const created = { id: 'env-3', projectId: 'p1', name: 'QA', slug: 'qa', isDefault: false, createdAt: new Date().toISOString() }
    vi.mocked(api.createEnvironment).mockResolvedValue(created)
    const { onEnvironmentCreated } = setup('settings')

    fireEvent.click(screen.getByRole('button', { name: 'Add environment' }))
    fireEvent.change(screen.getByLabelText('Environment name'), { target: { value: 'QA' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create environment' }))

    await waitFor(() => {
      expect(api.createEnvironment).toHaveBeenCalledWith({ projectId: 'p1', name: 'QA' })
      expect(onEnvironmentCreated).toHaveBeenCalledWith(created)
    })
  })
})
