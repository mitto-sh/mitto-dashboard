import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { ServiceCard } from '@/components/ServiceCard'
import type { Service } from '@/lib/types'

const service: Service = {
  id: 'svc-1',
  projectId: 'proj-1',
  name: 'web',
  type: 'web',
  port: 3000,
  cpu: 256,
  memory: 512,
}

function renderCard(overrides: Partial<Parameters<typeof ServiceCard>[0]> = {}) {
  const onSelect = vi.fn()
  render(
    <DndContext>
      <ServiceCard
        service={service}
        position={{ x: 10, y: 20 }}
        latestStatus="live"
        onSelect={onSelect}
        {...overrides}
      />
    </DndContext>,
  )
  return { onSelect }
}

describe('ServiceCard', () => {
  it('renders the service name, type, port and status', () => {
    renderCard()
    expect(screen.getAllByText('web')).toHaveLength(2) // name + type badge
    expect(screen.getByText(':3000')).toBeInTheDocument()
    expect(screen.getByText('live')).toBeInTheDocument()
  })

  it('renders "no port" when the service has none', () => {
    renderCard({ service: { ...service, port: null } })
    expect(screen.getByText('no port')).toBeInTheDocument()
  })

  it('omits the status badge when there is no deployment yet', () => {
    renderCard({ latestStatus: null })
    expect(screen.queryByText('live')).not.toBeInTheDocument()
  })

  it('calls onSelect when clicked', () => {
    const { onSelect } = renderCard()
    fireEvent.click(screen.getByTestId('service-card-svc-1'))
    expect(onSelect).toHaveBeenCalledWith(service)
  })
})
