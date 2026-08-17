import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithTheme } from '../helpers/renderWithTheme'
import { setToken } from '@/lib/auth'
import type { Project } from '@/lib/types'

let searchParams = new URLSearchParams()
const routerReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: routerReplace }),
  useSearchParams: () => searchParams,
}))

vi.mock('@/lib/api', () => ({
  api: {
    listProjects: vi.fn(),
    createProject: vi.fn(),
    listGithubInstallations: vi.fn(),
  },
}))

import { api } from '@/lib/api'

const project: Project = { id: 'p1', name: 'My App', slug: 'my-app', region: 'us-east-1', isPrivate: true, enabled: true }
const disabledProject: Project = { ...project, id: 'p2', name: 'Paused App', slug: 'paused-app', enabled: false }

describe('ProjectsPage', () => {
  beforeEach(() => {
    setToken('a-token')
    searchParams = new URLSearchParams()
    routerReplace.mockClear()
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

  it('opens the GitHub import modal', async () => {
    vi.mocked(api.listGithubInstallations).mockResolvedValue([])
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('No projects yet')
    fireEvent.click(screen.getByText('Import from GitHub'))

    expect(await screen.findByText('Connect GitHub')).toBeInTheDocument()
  })

  it('shows a success banner after connecting GitHub', async () => {
    searchParams = new URLSearchParams('github_connected=1')
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    expect(await screen.findByText(/GitHub connected/)).toBeInTheDocument()
  })

  it('shows a friendly error banner for a known github_error code', async () => {
    searchParams = new URLSearchParams('github_error=invalid_state')
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    expect(await screen.findByText(/expired or was invalid/)).toBeInTheDocument()
  })

  it('shows a disabled badge for disabled projects in the list', async () => {
    vi.mocked(api.listProjects).mockResolvedValue([project, disabledProject])
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('Paused App')
    expect(screen.getByText('disabled')).toBeInTheDocument()
  })
})
