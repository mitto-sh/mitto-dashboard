import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../helpers/renderWithTheme'
import { setToken } from '@/lib/auth'
import type { Project } from '@/lib/types'

let searchParams = new URLSearchParams()
const routerReplace = vi.fn()
const routerPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: routerReplace, push: routerPush }),
  useSearchParams: () => searchParams,
}))

vi.mock('@/lib/api', () => ({
  api: {
    me: vi.fn(),
    listProjects: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    listEnvironments: vi.fn(),
    createEnvironment: vi.fn(),
    updateEnvironment: vi.fn(),
    deleteEnvironment: vi.fn(),
  },
}))

import { api } from '@/lib/api'

const project: Project = {
  id: 'p1', name: 'My App', slug: 'my-app', region: 'us-east-1',
  isPrivate: true, enabled: true, createdAt: new Date().toISOString(),
}
const disabledProject: Project = { ...project, id: 'p2', name: 'Paused App', slug: 'paused-app', enabled: false }
const publicProject: Project = { ...project, id: 'p3', name: 'Docs Site', slug: 'docs-site', isPrivate: false }

describe('ProjectsPage', () => {
  beforeEach(() => {
    setToken('a-token')
    searchParams = new URLSearchParams()
    routerReplace.mockClear()
    routerPush.mockClear()
    vi.mocked(api.listProjects).mockResolvedValue([])
    vi.mocked(api.listEnvironments).mockResolvedValue([])
    vi.mocked(api.me).mockResolvedValue({ id: 'u1', email: 'test@example.com', name: 'Test User', avatarUrl: null, plan: 'free' })
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

  it('creates a project via the New project button and adds it to the list', async () => {
    vi.mocked(api.createProject).mockResolvedValue(project)
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('No projects yet')
    fireEvent.click(screen.getByRole('button', { name: 'New project' }))

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'My App' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(api.createProject).toHaveBeenCalledWith({ name: 'My App' }))
    expect(await screen.findByText('My App')).toBeInTheDocument()
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
    await userEvent.click(screen.getByLabelText('Project actions'))
    await userEvent.click(await screen.findByText('Delete'))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(api.deleteProject).toHaveBeenCalledWith('p1')
      expect(screen.queryByText('My App')).not.toBeInTheDocument()
    })
  })

  it('opens the settings panel inline from the card menu, without navigating away', async () => {
    vi.mocked(api.listProjects).mockResolvedValue([project])
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('My App')
    await userEvent.click(screen.getByLabelText('Project actions'))
    await userEvent.click(await screen.findByText('Settings'))

    expect(await screen.findByRole('button', { name: 'Delete project' })).toBeInTheDocument()
    expect(await screen.findByText('Projects')).toBeInTheDocument()
    expect(routerPush).not.toHaveBeenCalled()
  })

  it('saves a rename from the inline settings panel and reflects it on the card', async () => {
    vi.mocked(api.listProjects).mockResolvedValue([project])
    vi.mocked(api.updateProject).mockResolvedValue({ ...project, name: 'Renamed App' })
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('My App')
    await userEvent.click(screen.getByLabelText('Project actions'))
    await userEvent.click(await screen.findByText('Settings'))

    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Renamed App' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(api.updateProject).toHaveBeenCalledWith('p1', { name: 'Renamed App', isPrivate: true, enabled: true })
    })
    expect(await screen.findAllByText('Renamed App')).not.toHaveLength(0)
  })

  it('opens the command palette from the header trigger and navigates on select', async () => {
    vi.mocked(api.listProjects).mockResolvedValue([project])
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('My App')
    fireEvent.click(screen.getByText('Jump to…'))

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(await within(dialog).findByText('My App'))
    expect(routerPush).toHaveBeenCalledWith('/projects/p1')
  })

  it('opens the command palette with the ⌘K shortcut', async () => {
    vi.mocked(api.listProjects).mockResolvedValue([project])
    const { default: ProjectsPage } = await import('@/app/projects/page')
    renderWithTheme(<ProjectsPage />)

    await screen.findByText('My App')
    fireEvent.keyDown(window, { key: 'k', metaKey: true })

    expect(await screen.findByPlaceholderText('Jump to a project…')).toBeInTheDocument()
  })
})
