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
    deleteProject: vi.fn(),
    listGithubInstallations: vi.fn(),
  },
}))

import { api } from '@/lib/api'

const project: Project = {
  id: 'p1', name: 'My App', slug: 'my-app', region: 'us-east-1',
  isPrivate: true, enabled: true, createdAt: new Date().toISOString(),
}
const disabledProject: Project = { ...project, id: 'p2', name: 'Paused App', slug: 'paused-app', enabled: false }
const publicProject: Project = { ...project, id: 'p3', name: 'Docs Site', slug: 'docs-site', isPrivate: false }

async function openAddNewMenu() {
  fireEvent.click(screen.getByRole('button', { name: /Add New/ }))
}

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

  it('lists existing projects as cards linking to the project', async () => {
    vi.mocked(api.listProjects).mockResolvedValue([project])
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    expect(await screen.findByText('My App')).toBeInTheDocument()
    expect(screen.getAllByRole('link').find((el) => el.getAttribute('href') === '/projects/p1')).toBeTruthy()
  })

  it('shows private/public and service count on each card', async () => {
    vi.mocked(api.listProjects).mockResolvedValue([project, publicProject])
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('My App')
    expect(screen.getAllByText('Private')).toHaveLength(1)
    expect(screen.getAllByText('Public')).toHaveLength(1)
    expect(screen.getAllByText('0 services')).toHaveLength(2)
  })

  it('creates a project via the Add New menu and adds it to the list', async () => {
    vi.mocked(api.createProject).mockResolvedValue(project)
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('No projects yet')
    await openAddNewMenu()
    fireEvent.click(screen.getByRole('button', { name: 'Project' }))

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'My App' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(api.createProject).toHaveBeenCalledWith({ name: 'My App' }))
    expect(await screen.findByText('My App')).toBeInTheDocument()
  })

  it('opens the GitHub import modal via the Add New menu', async () => {
    vi.mocked(api.listGithubInstallations).mockResolvedValue([])
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('No projects yet')
    await openAddNewMenu()
    fireEvent.click(screen.getByRole('button', { name: 'Import from GitHub' }))

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

  it('filters projects by the search box', async () => {
    vi.mocked(api.listProjects).mockResolvedValue([project, disabledProject])
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('My App')
    fireEvent.change(screen.getByLabelText('Search projects'), { target: { value: 'paused' } })

    expect(screen.queryByText('My App')).not.toBeInTheDocument()
    expect(screen.getByText('Paused App')).toBeInTheDocument()
  })

  it('shows a no-match message when the search filters out everything', async () => {
    vi.mocked(api.listProjects).mockResolvedValue([project])
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('My App')
    fireEvent.change(screen.getByLabelText('Search projects'), { target: { value: 'zzz' } })

    expect(await screen.findByText(/No projects match/)).toBeInTheDocument()
  })

  it('deletes a project from the card quick-actions menu', async () => {
    vi.mocked(api.listProjects).mockResolvedValue([project])
    vi.mocked(api.deleteProject).mockResolvedValue(undefined)
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('My App')
    fireEvent.click(screen.getByLabelText('Project actions'))
    fireEvent.click(screen.getByText('Delete'))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(api.deleteProject).toHaveBeenCalledWith('p1')
      expect(screen.queryByText('My App')).not.toBeInTheDocument()
    })
  })

  it('links to the project settings page from the card menu', async () => {
    vi.mocked(api.listProjects).mockResolvedValue([project])
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('My App')
    fireEvent.click(screen.getByLabelText('Project actions'))

    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/projects/p1/settings')
  })
})
