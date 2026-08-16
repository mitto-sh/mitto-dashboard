import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { Canvas } from '@/components/Canvas'
import { renderWithTheme } from '../helpers/renderWithTheme'
import type { Service, Deployment } from '@/lib/types'

const services: Service[] = [
  { id: 'svc-1', projectId: 'p1', name: 'web', type: 'web', port: 3000, cpu: 256, memory: 512 },
  { id: 'svc-2', projectId: 'p1', name: 'worker', type: 'worker', port: null, cpu: 256, memory: 512 },
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

  it('shows the footer counter and theme/language controls when there are services', () => {
    renderCanvas()
    expect(screen.getByText(/02 services/)).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle language')).toBeInTheDocument()
  })

  it('shows the empty state and calls onAddService when there are no services', () => {
    const { onAddService } = renderCanvas({ services: [] })
    expect(screen.queryByTestId(/service-card-/)).not.toBeInTheDocument()
    expect(screen.getByText('No services in this project')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Add service' }))
    expect(onAddService).toHaveBeenCalled()
  })

  it('toggles theme and language via the bottom-left controls', () => {
    renderCanvas()
    fireEvent.click(screen.getByLabelText('Toggle language'))
    expect(screen.getByLabelText('Toggle language')).toHaveTextContent('EN')

    fireEvent.click(screen.getByLabelText('Toggle theme'))
    // dot-pulse animation aside, a successful re-render without crash is the assertion here
    expect(screen.getByTestId('service-card-svc-1')).toBeInTheDocument()
  })
})
