import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateProjectModal } from '@/app/projects/components/CreateProjectModal'
import { renderWithTheme } from '../../../helpers/renderWithTheme'
import type { Project } from '@/lib/types'

vi.mock('@/lib/api', () => ({
  api: { createProject: vi.fn() },
}))

import { api } from '@/lib/api'

const project: Project = {
  id: 'p1', name: 'New App', slug: 'new-app', region: 'us-east-1',
  isPrivate: true, enabled: true, createdAt: new Date().toISOString(),
}

describe('CreateProjectModal', () => {
  it('creates a project with a valid name', async () => {
    vi.mocked(api.createProject).mockResolvedValue(project)
    const onCreated = vi.fn()
    renderWithTheme(<CreateProjectModal onCancel={vi.fn()} onCreated={onCreated} />)

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New App' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(api.createProject).toHaveBeenCalledWith({ name: 'New App' })
      expect(onCreated).toHaveBeenCalledWith(project)
    })
  })

  it('shows a validation error for an empty name', async () => {
    renderWithTheme(<CreateProjectModal onCancel={vi.fn()} onCreated={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(api.createProject).not.toHaveBeenCalled()
  })

  it('shows an error message when creation fails', async () => {
    vi.mocked(api.createProject).mockRejectedValue(new Error('slug taken'))
    renderWithTheme(<CreateProjectModal onCancel={vi.fn()} onCreated={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New App' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('slug taken')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn()
    renderWithTheme(<CreateProjectModal onCancel={onCancel} onCreated={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })
})
