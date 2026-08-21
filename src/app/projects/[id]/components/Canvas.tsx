'use client'

import { useEffect, useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import type { Service, Deployment } from '@/lib/types'
import { loadPositions, savePosition, resolvePosition, type Position } from '@/lib/canvasPositions'
import { useThemeContext } from '@/components/ThemeProvider'
import { ServiceCard } from './ServiceCard'
import { PlusIcon } from '@/components/icons'

interface CanvasProps {
  projectId: string
  services: Service[]
  latestDeployments: Record<string, Deployment | undefined>
  selectedServiceId: string | null
  onSelectService: (service: Service) => void
  onAddService: () => void
}

export function Canvas({
  projectId,
  services,
  latestDeployments,
  selectedServiceId,
  onSelectService,
  onAddService,
}: CanvasProps) {
  const { dict } = useThemeContext()
  const [positions, setPositions] = useState<Record<string, Position>>({})
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

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
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="relative h-[calc(100vh-56px)] w-full overflow-auto bg-canvas">
        {services.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-dashed border-dashedBorder">
              <PlusIcon size={20} className="text-ink-faint" />
            </div>
            <div className="text-center">
              <p className="text-sm text-ink-secondary">{dict.emptyTitle}</p>
              <p className="mt-[6px] font-mono text-xs text-ink-muted">{dict.emptySub}</p>
            </div>
            <button
              onClick={onAddService}
              className="mt-1 inline-flex items-center gap-[6px] rounded-lg bg-primary px-[18px] py-[9px] text-caption font-semibold text-primary-foreground transition-colors"
            >
              <PlusIcon size={13} />
              {dict.addService}
            </button>
          </div>
        ) : (
          services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              position={resolvePosition(projectId, service.id, index, positions)}
              latestStatus={latestDeployments[service.id]?.status ?? null}
              selected={service.id === selectedServiceId}
              onSelect={onSelectService}
            />
          ))
        )}
        {services.length > 0 && (
          <div className="pointer-events-none absolute bottom-4 right-5 font-mono text-label text-ink-faint">
            {String(services.length).padStart(2, '0')} {dict.servicesFooter}
          </div>
        )}
      </div>
    </DndContext>
  )
}
