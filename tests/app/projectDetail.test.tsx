import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithTheme } from '../helpers/renderWithTheme'
import { setToken } from '@/lib/auth'
import type { Project, Service } from '@/lib/types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useParams: () => ({ id: 'p1' }),
}))

vi.mock('@/lib/api', () => ({
  api: {
    getProject: vi.fn(),
    listDeployments: vi.fn(),
    createService: vi.fn(),
    listEnvVars: vi.fn(),
    listGithubInstallations: vi.fn(),
    listInstallationRepos: vi.fn(),
    getRepoConfig: vi.fn(),
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
  isPrivate: true, enabled: true, createdAt: new Date().toISOString(), services: [service],
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

  it('opens the add-service chooser, picks manual configuration, and creates a service', async () => {
    const newService: Service = { ...service, id: 'svc-2', name: 'worker', type: 'worker' }
    vi.mocked(api.createService).mockResolvedValue(newService)

    const { default: ProjectPage } = await import('@/app/projects/[id]/page')
    renderWithTheme(<ProjectPage />)

    await screen.findByText('my-app')
    fireEvent.click(screen.getByRole('button', { name: 'Add service' }))
    fireEvent.click(screen.getByText('Manual configuration'))
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

  it('opens the add-service chooser, picks GitHub, and imports a service into this project', async () => {
    const installation = { id: 'i1', installationId: '999', accountLogin: 'acme', accountType: 'Organization' as const }
    const repo = { id: 1, name: 'api', full_name: 'acme/api', private: false, default_branch: 'main', html_url: 'https://github.com/acme/api' }
    const importedService: Service = {
      ...service, id: 'svc-3', name: 'api', repoUrl: repo.html_url, repoProvider: 'github', defaultBranch: 'main',
    }
    vi.mocked(api.listGithubInstallations).mockResolvedValue([installation])
    vi.mocked(api.listInstallationRepos).mockResolvedValue([repo])
    vi.mocked(api.getRepoConfig).mockResolvedValue({ found: false })
    vi.mocked(api.createService).mockResolvedValue(importedService)

    const { default: ProjectPage } = await import('@/app/projects/[id]/page')
    renderWithTheme(<ProjectPage />)

    await screen.findByText('my-app')
    fireEvent.click(screen.getByRole('button', { name: 'Add service' }))
    fireEvent.click(screen.getByText('Import from GitHub'))

    fireEvent.click(await screen.findByText('acme'))
    fireEvent.click(await screen.findByText('api'))
    fireEvent.click(await screen.findByRole('button', { name: 'Import' }))

    await waitFor(() => {
      expect(api.createService).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 'p1', name: 'api', repoProvider: 'github' }),
      )
    })
    expect(await screen.findByTestId('service-card-svc-3')).toBeInTheDocument()
  })

  it('opens the service detail panel when a service card is clicked', async () => {
    const { default: ProjectPage } = await import('@/app/projects/[id]/page')
    renderWithTheme(<ProjectPage />)

    await screen.findByText('my-app')
    fireEvent.click(screen.getByTestId('service-card-svc-1'))

    expect(await screen.findByLabelText('Close panel')).toBeInTheDocument()
  })

  it('links the settings icon to the project settings page', async () => {
    const { default: ProjectPage } = await import('@/app/projects/[id]/page')
    renderWithTheme(<ProjectPage />)

    await screen.findByText('my-app')
    expect(screen.getByLabelText('Project settings')).toHaveAttribute('href', '/projects/p1/settings')
  })

  it('shows a disabled badge when the project is disabled', async () => {
    vi.mocked(api.getProject).mockResolvedValue({ ...project, enabled: false })

    const { default: ProjectPage } = await import('@/app/projects/[id]/page')
    renderWithTheme(<ProjectPage />)

    expect(await screen.findByText('disabled')).toBeInTheDocument()
  })
})
