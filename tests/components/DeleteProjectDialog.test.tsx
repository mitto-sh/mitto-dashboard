import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { DeleteProjectDialog } from '@/components/DeleteProjectDialog'
import { renderWithTheme } from '../helpers/renderWithTheme'
import type { Project } from '@/lib/types'

vi.mock('@/lib/api', () => ({
  api: { deleteProject: vi.fn() },
}))

import { api } from '@/lib/api'

const project: Project = {
  id: 'p1', name: 'Acme', slug: 'acme', region: 'us-east-1',
  isPrivate: true, enabled: true, createdAt: new Date().toISOString(),
}

describe('DeleteProjectDialog', () => {
  it('deletes the project and calls onDeleted', async () => {
    vi.mocked(api.deleteProject).mockResolvedValue(undefined)
    const onDeleted = vi.fn()
    renderWithTheme(<DeleteProjectDialog project={project} onCancel={vi.fn()} onDeleted={onDeleted} />)

    expect(screen.getByText(/Acme/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(api.deleteProject).toHaveBeenCalledWith('p1')
      expect(onDeleted).toHaveBeenCalled()
    })
  })

  it('shows an error message when deletion fails', async () => {
    vi.mocked(api.deleteProject).mockRejectedValue(new Error('cannot delete'))
    renderWithTheme(<DeleteProjectDialog project={project} onCancel={vi.fn()} onDeleted={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(await screen.findByText('cannot delete')).toBeInTheDocument()
  })

  it('calls onCancel when "Keep project" is clicked', () => {
    const onCancel = vi.fn()
    renderWithTheme(<DeleteProjectDialog project={project} onCancel={onCancel} onDeleted={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Keep project' }))
    expect(onCancel).toHaveBeenCalled()
  })
})
