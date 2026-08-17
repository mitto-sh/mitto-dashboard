import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { ProjectSettingsModal } from '@/components/ProjectSettingsModal'
import { renderWithTheme } from '../helpers/renderWithTheme'
import type { Project } from '@/lib/types'

vi.mock('@/lib/api', () => ({
  api: {
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}))

import { api } from '@/lib/api'

const project: Project = {
  id: 'p1', name: 'Acme', slug: 'acme', region: 'us-east-1', isPrivate: true, enabled: true,
}

describe('ProjectSettingsModal', () => {
  it('shows current values pre-filled', () => {
    renderWithTheme(<ProjectSettingsModal project={project} onCancel={vi.fn()} onUpdated={vi.fn()} onDeleted={vi.fn()} />)

    expect(screen.getByLabelText('Private')).toBeChecked()
    expect(screen.getByLabelText('Enabled')).toBeChecked()
    expect(screen.getByDisplayValue('Acme')).toBeInTheDocument()
  })

  it('saves a rename and toggled flags', async () => {
    const updated: Project = { ...project, name: 'Acme Inc', slug: 'acme-inc', isPrivate: false, enabled: false }
    vi.mocked(api.updateProject).mockResolvedValue(updated)
    const onUpdated = vi.fn()

    renderWithTheme(<ProjectSettingsModal project={project} onCancel={vi.fn()} onUpdated={onUpdated} onDeleted={vi.fn()} />)

    fireEvent.change(screen.getByDisplayValue('Acme'), { target: { value: 'Acme Inc' } })
    fireEvent.click(screen.getByLabelText('Private'))
    fireEvent.click(screen.getByLabelText('Enabled'))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(api.updateProject).toHaveBeenCalledWith('p1', { name: 'Acme Inc', isPrivate: false, enabled: false })
      expect(onUpdated).toHaveBeenCalledWith(updated)
    })
  })

  it('shows a validation error for an empty name and does not submit', async () => {
    renderWithTheme(<ProjectSettingsModal project={project} onCancel={vi.fn()} onUpdated={vi.fn()} onDeleted={vi.fn()} />)

    fireEvent.change(screen.getByDisplayValue('Acme'), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(api.updateProject).not.toHaveBeenCalled()
  })

  it('shows a hint when disabling', () => {
    renderWithTheme(<ProjectSettingsModal project={project} onCancel={vi.fn()} onUpdated={vi.fn()} onDeleted={vi.fn()} />)

    fireEvent.click(screen.getByLabelText('Enabled'))
    expect(screen.getByText(/new deployments will be blocked/)).toBeInTheDocument()
  })

  it('shows a save error message on failure', async () => {
    vi.mocked(api.updateProject).mockRejectedValue(new Error('conflict'))
    renderWithTheme(<ProjectSettingsModal project={project} onCancel={vi.fn()} onUpdated={vi.fn()} onDeleted={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('conflict')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn()
    renderWithTheme(<ProjectSettingsModal project={project} onCancel={onCancel} onUpdated={vi.fn()} onDeleted={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('requires a confirm step before deleting', async () => {
    vi.mocked(api.deleteProject).mockResolvedValue(undefined)
    const onDeleted = vi.fn()
    renderWithTheme(<ProjectSettingsModal project={project} onCancel={vi.fn()} onUpdated={vi.fn()} onDeleted={onDeleted} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete project' }))
    expect(screen.getByText(/Delete "Acme" and all its services/)).toBeInTheDocument()
    expect(api.deleteProject).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(api.deleteProject).toHaveBeenCalledWith('p1')
      expect(onDeleted).toHaveBeenCalled()
    })
  })

  it('cancels the delete confirmation without deleting', () => {
    renderWithTheme(<ProjectSettingsModal project={project} onCancel={vi.fn()} onUpdated={vi.fn()} onDeleted={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete project' }))
    fireEvent.click(screen.getByRole('button', { name: 'Keep project' }))

    expect(screen.getByRole('button', { name: 'Delete project' })).toBeInTheDocument()
    expect(api.deleteProject).not.toHaveBeenCalled()
  })

  it('shows an error message when delete fails', async () => {
    vi.mocked(api.deleteProject).mockRejectedValue(new Error('cannot delete'))
    renderWithTheme(<ProjectSettingsModal project={project} onCancel={vi.fn()} onUpdated={vi.fn()} onDeleted={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete project' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(await screen.findByText('cannot delete')).toBeInTheDocument()
  })
})
