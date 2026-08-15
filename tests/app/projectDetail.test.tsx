import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
  },
}))

import { api } from '@/lib/api'

const service: Service = { id: 'svc-1', projectId: 'p1', name: 'web', type: 'web', port: 3000, cpu: 256, memory: 512 }
const project: Project = {
  id: 'p1', name: 'My App', slug: 'my-app', repoUrl: null, runtime: null, region: 'us-east-1', services: [service],
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
    render(<ProjectPage />)

    expect(await screen.findByText('My App')).toBeInTheDocument()
    expect(screen.getByTestId('service-card-svc-1')).toBeInTheDocument()
  })

  it('opens the add-service modal and creates a service', async () => {
    const newService: Service = { ...service, id: 'svc-2', name: 'worker', type: 'worker' }
    vi.mocked(api.createService).mockResolvedValue(newService)

    const { default: ProjectPage } = await import('@/app/projects/[id]/page')
    render(<ProjectPage />)

    await screen.findByText('My App')
    fireEvent.click(screen.getByRole('button', { name: '+ Add service' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'worker' } })
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'worker' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(api.createService).toHaveBeenCalledWith({
        projectId: 'p1', name: 'worker', type: 'worker', port: undefined,
      })
    })
    expect(await screen.findByTestId('service-card-svc-2')).toBeInTheDocument()
  })

  it('opens the service detail panel when a service card is clicked', async () => {
    const { default: ProjectPage } = await import('@/app/projects/[id]/page')
    render(<ProjectPage />)

    await screen.findByText('My App')
    fireEvent.click(screen.getByTestId('service-card-svc-1'))

    expect(await screen.findByLabelText('Close panel')).toBeInTheDocument()
  })
})
