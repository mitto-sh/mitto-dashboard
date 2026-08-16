import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithTheme } from '../helpers/renderWithTheme'
import { setToken } from '@/lib/auth'
import type { Project } from '@/lib/types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}))

vi.mock('@/lib/api', () => ({
  api: {
    listProjects: vi.fn(),
    createProject: vi.fn(),
  },
}))

import { api } from '@/lib/api'

const project: Project = { id: 'p1', name: 'My App', slug: 'my-app', repoUrl: null, runtime: null, region: 'us-east-1' }

describe('ProjectsPage', () => {
  beforeEach(() => {
    setToken('a-token')
    vi.mocked(api.listProjects).mockResolvedValue([])
  })

  it('shows an empty state when there are no projects', async () => {
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    expect(await screen.findByText('No projects yet')).toBeInTheDocument()
  })

  it('lists existing projects', async () => {
    vi.mocked(api.listProjects).mockResolvedValue([project])
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    expect(await screen.findByText('My App')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /My App/ })).toHaveAttribute('href', '/projects/p1')
  })

  it('creates a project and adds it to the list', async () => {
    vi.mocked(api.createProject).mockResolvedValue(project)
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('No projects yet')
    fireEvent.change(screen.getByLabelText('Project name'), { target: { value: 'My App' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(api.createProject).toHaveBeenCalledWith({ name: 'My App' }))
    expect(await screen.findByText('My App')).toBeInTheDocument()
  })

  it('shows a validation error for an empty project name', async () => {
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('No projects yet')
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(api.createProject).not.toHaveBeenCalled()
  })
})
