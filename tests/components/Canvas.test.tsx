import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Canvas } from '@/components/Canvas'
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

describe('Canvas', () => {
  it('renders a card for every service', () => {
    render(
      <Canvas projectId="p1" services={services} latestDeployments={deployments} onSelectService={vi.fn()} />,
    )
    expect(screen.getByTestId('service-card-svc-1')).toBeInTheDocument()
    expect(screen.getByTestId('service-card-svc-2')).toBeInTheDocument()
  })

  it('calls onSelectService when a card is clicked', () => {
    const onSelectService = vi.fn()
    render(
      <Canvas projectId="p1" services={services} latestDeployments={deployments} onSelectService={onSelectService} />,
    )
    fireEvent.click(screen.getByTestId('service-card-svc-2'))
    expect(onSelectService).toHaveBeenCalledWith(services[1])
  })

  it('renders nothing when there are no services', () => {
    render(<Canvas projectId="p1" services={[]} latestDeployments={{}} onSelectService={vi.fn()} />)
    expect(screen.queryByTestId(/service-card-/)).not.toBeInTheDocument()
  })

})
