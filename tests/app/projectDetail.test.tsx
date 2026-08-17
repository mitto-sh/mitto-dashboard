import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithTheme } from '../helpers/renderWithTheme'
import { setToken } from '@/lib/auth'
import type { Project, Service } from '@/lib/types'

const routerPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: routerPush }),
  useParams: () => ({ id: 'p1' }),
}))

vi.mock('@/lib/api', () => ({
  api: {
    getProject: vi.fn(),
    listDeployments: vi.fn(),
    createService: vi.fn(),
    listEnvVars: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}))

import { api } from '@/lib/api'

const service: Service = {
  id: 'svc-1', projectId: 'p1', name: 'web', type: 'web', port: 3000, cpu: 256, memory: 512,
  repoUrl: null, repoProvider: null, defaultBranch: 'main',
  buildCommand: null, startCommand: null, outputDir: null, runtime: null,
}
const project: Project = {
  id: 'p1', name: 'My App', slug: 'my-app', region: 'us-east-1',
  isPrivate: true, enabled: true, services: [service],
}

describe('ProjectPage (canvas)', () => {
  beforeEach(() => {
    setToken('a-token')
    vi.mocked(api.getProject).mockResolvedValue(project)
    vi.mocked(api.listDeployments).mockResolvedValue([])
    vi.mocked(api.listEnvVars).mockResolvedValue([])
  })

  it('renders the project name and its services on the canvas', async () => {
    const { default: ProjectPage } = await import('@/app/projects/[id]/page')
    renderWithTheme(<ProjectPage />)

    expect(await screen.findByText('my-app')).toBeInTheDocument()
    expect(screen.getByTestId('service-card-svc-1')).toBeInTheDocument()
  })

  it('opens the add-service modal and creates a service', async () => {
    const newService: Service = { ...service, id: 'svc-2', name: 'worker', type: 'worker' }
    vi.mocked(api.createService).mockResolvedValue(newService)

    const { default: ProjectPage } = await import('@/app/projects/[id]/page')
    renderWithTheme(<ProjectPage />)

    await screen.findByText('my-app')
    fireEvent.click(screen.getByRole('button', { name: 'Add service' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'worker' } })
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'worker' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create service' }))

    await waitFor(() => {
      expect(api.createService).toHaveBeenCalledWith({
        projectId: 'p1', name: 'worker', type: 'worker', port: undefined,
      })
    })
    expect(await screen.findByTestId('service-card-svc-2')).toBeInTheDocument()
  })

  it('opens the service detail panel when a service card is clicked', async () => {
    const { default: ProjectPage } = await import('@/app/projects/[id]/page')
    renderWithTheme(<ProjectPage />)

    await screen.findByText('my-app')
    fireEvent.click(screen.getByTestId('service-card-svc-1'))

    expect(await screen.findByLabelText('Close panel')).toBeInTheDocument()
  })

  it('opens project settings, saves an update, and reflects it on the page', async () => {
    const updated: Project = { ...project, name: 'Renamed', slug: 'renamed', services: [service] }
    vi.mocked(api.updateProject).mockResolvedValue(updated)

    const { default: ProjectPage } = await import('@/app/projects/[id]/page')
    renderWithTheme(<ProjectPage />)

    await screen.findByText('my-app')
    fireEvent.click(screen.getByLabelText('Project settings'))
    fireEvent.click(await screen.findByRole('button', { name: 'Save' }))

    await waitFor(() => expect(api.updateProject).toHaveBeenCalled())
    expect(await screen.findByText('renamed')).toBeInTheDocument()
  })

  it('shows a disabled badge when the project is disabled', async () => {
    vi.mocked(api.getProject).mockResolvedValue({ ...project, enabled: false })

    const { default: ProjectPage } = await import('@/app/projects/[id]/page')
    renderWithTheme(<ProjectPage />)

    expect(await screen.findByText('disabled')).toBeInTheDocument()
  })

  it('navigates to /projects after deleting the project from settings', async () => {
    vi.mocked(api.deleteProject).mockResolvedValue(undefined)

    const { default: ProjectPage } = await import('@/app/projects/[id]/page')
    renderWithTheme(<ProjectPage />)

    await screen.findByText('my-app')
    fireEvent.click(screen.getByLabelText('Project settings'))
    fireEvent.click(await screen.findByRole('button', { name: 'Delete project' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith('/projects'))
  })
})
