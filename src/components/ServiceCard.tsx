'use client'

import { useDraggable } from '@dnd-kit/core'
import type { Service, DeploymentStatus } from '@/lib/types'
import type { Position } from '@/lib/canvasPositions'
import { DeploymentStatusBadge } from './DeploymentStatusBadge'

interface ServiceCardProps {
  service: Service
  position: Position
  latestStatus: DeploymentStatus | null
  onSelect: (service: Service) => void
}

export function ServiceCard({ service, position, latestStatus, onSelect }: ServiceCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: service.id,
  })

  const style: React.CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onSelect(service)}
      data-testid={`service-card-${service.id}`}
      className="w-60 cursor-grab select-none rounded-lg border border-border bg-surface p-4 shadow-lg transition hover:border-gray-500 active:cursor-grabbing"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{service.name}</span>
        <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400">{service.type}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{service.port ? `:${service.port}` : 'no port'}</span>
        {latestStatus && <DeploymentStatusBadge status={latestStatus} />}
      </div>
    </div>
  )
}
