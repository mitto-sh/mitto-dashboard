'use client'

import { useEffect, useState } from 'react'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import type { Service, Deployment, DeploymentStatus } from '@/lib/types'
import { loadPositions, savePosition, resolvePosition, type Position } from '@/lib/canvasPositions'
import { ServiceCard } from './ServiceCard'

interface CanvasProps {
  projectId: string
  services: Service[]
  latestDeployments: Record<string, Deployment | undefined>
  onSelectService: (service: Service) => void
}

export function Canvas({ projectId, services, latestDeployments, onSelectService }: CanvasProps) {
  const [positions, setPositions] = useState<Record<string, Position>>({})

  useEffect(() => {
    setPositions(loadPositions(projectId))
  }, [projectId])

  function handleDragEnd(event: DragEndEvent) {
    const serviceId = event.active.id as string
    const current = resolvePosition(
      projectId,
      serviceId,
      services.findIndex((s) => s.id === serviceId),
      positions,
    )
    const next: Position = {
      x: current.x + event.delta.x,
      y: current.y + event.delta.y,
    }
    savePosition(projectId, serviceId, next)
    setPositions((prev) => ({ ...prev, [serviceId]: next }))
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="relative h-[calc(100vh-4rem)] w-full overflow-auto bg-canvas bg-[radial-gradient(circle,#1a1e24_1px,transparent_1px)] bg-[size:24px_24px]">
        {services.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            position={resolvePosition(projectId, service.id, index, positions)}
            latestStatus={latestDeployments[service.id]?.status ?? null}
            onSelect={onSelectService}
          />
        ))}
      </div>
    </DndContext>
  )
}
