import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { Canvas } from '@/app/projects/[slug]/components/Canvas'
import { renderWithTheme } from '../../../../helpers/renderWithTheme'
import type { Service, Deployment } from '@/lib/types'

const services: Service[] = [
  { id: 'svc-1', projectId: 'p1', name: 'web', type: 'web', port: 3000, cpu: 256, memory: 512, enabled: true },
  { id: 'svc-2', projectId: 'p1', name: 'worker', type: 'worker', port: null, cpu: 256, memory: 512, enabled: true },
]

const deployments: Record<string, Deployment | undefined> = {
  'svc-1': {
    id: 'd1', serviceId: 'svc-1', status: 'live', commitSha: null,
    commitMessage: null, deployUrl: null, errorMessage: null, createdAt: '',
  },
}

function renderCanvas(overrides: Partial<Parameters<typeof Canvas>[0]> = {}) {
  const onSelectService = vi.fn()
  const onAddService = vi.fn()
  renderWithTheme(
    <Canvas
      projectId="p1"
      services={services}
      latestDeployments={deployments}
      selectedServiceId={null}
      onSelectService={onSelectService}
      onAddService={onAddService}
      {...overrides}
    />,
  )
  return { onSelectService, onAddService }
}

describe('Canvas', () => {
  it('renders a card for every service', () => {
    renderCanvas()
    expect(screen.getByTestId('service-card-svc-1')).toBeInTheDocument()
    expect(screen.getByTestId('service-card-svc-2')).toBeInTheDocument()
  })

  it('calls onSelectService when a card is clicked', () => {
    const { onSelectService } = renderCanvas()
    fireEvent.click(screen.getByTestId('service-card-svc-2'))
    expect(onSelectService).toHaveBeenCalledWith(services[1])
  })

  it('shows the footer counter when there are services', () => {
    renderCanvas()
    expect(screen.getByText(/02 services/)).toBeInTheDocument()
  })

  it('omits the footer counter when there are no services', () => {
    renderCanvas({ services: [] })
    expect(screen.queryByText(/^\d{2} services$/)).not.toBeInTheDocument()
  })

  it('shows the empty state and calls onAddService when there are no services', () => {
    const { onAddService } = renderCanvas({ services: [] })
    expect(screen.queryByTestId(/service-card-/)).not.toBeInTheDocument()
    expect(screen.getByText('No services in this project')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Add service' }))
    expect(onAddService).toHaveBeenCalled()
  })
})
