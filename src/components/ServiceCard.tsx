'use client'

import { useDraggable } from '@dnd-kit/core'
import type { Service, DeploymentStatus } from '@/lib/types'
import type { Position } from '@/lib/canvasPositions'
import { statusLabel, isPulsing } from '@/lib/status'
import { statusColorFor, hexWithAlpha } from '@/lib/theme'
import { useThemeContext } from './ThemeProvider'
import { ServiceTypeIcon } from './icons'

interface ServiceCardProps {
  service: Service
  position: Position
  latestStatus: DeploymentStatus | null
  selected: boolean
  onSelect: (service: Service) => void
}

export function ServiceCard({ service, position, latestStatus, selected, onSelect }: ServiceCardProps) {
  const { theme } = useThemeContext()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: service.id,
  })

  const color = statusColorFor(theme, latestStatus)
  const hasStatus = latestStatus !== null
  const borderColor = hasStatus ? hexWithAlpha(color, isDragging ? 0.6 : 0.35) : theme.border
  const borderHoverColor = hasStatus ? hexWithAlpha(color, 0.6) : theme.faint
  const glow = hasStatus
    ? `0 0 0 1px ${hexWithAlpha(color, 0.14)}, 0 0 28px ${hexWithAlpha(color, 0.1)}`
    : '0 0 0 0 transparent'
  const shadow = isDragging ? `${glow}, ${theme.shadowDrag}` : `${glow}, ${theme.shadowCard}`

  const style: React.CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    transform: `${transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) ` : ''}${isDragging ? 'scale(1.03)' : 'scale(1)'}`,
    zIndex: isDragging ? 10 : selected ? 2 : 1,
    borderColor,
    backgroundColor: isDragging ? theme.cardDrag : theme.surface,
    color: theme.ink,
    boxShadow: shadow,
    transition: isDragging ? 'none' : 'box-shadow .15s ease, border-color .15s ease, transform .15s ease',
    ['--hover-border' as string]: borderHoverColor,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onSelect(service)}
      data-testid={`service-card-${service.id}`}
      className="w-[264px] cursor-grab touch-none select-none rounded-xl border p-[16px_18px] hover:[border-color:var(--hover-border)]"
    >
      <div className="flex items-center gap-[9px]">
        <span
          className={`h-2 w-2 flex-none rounded-full ${isPulsing(latestStatus) ? 'animate-dotPulse' : ''}`}
          style={{ backgroundColor: hasStatus ? color : theme.faint }}
        />
        <span className="flex-1 truncate text-[14.5px] font-semibold tracking-tight">{service.name}</span>
        <span
          className="inline-flex items-center gap-[5px] rounded-[5px] border px-[7px] py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.08em]"
          style={{ color: theme.sec, backgroundColor: theme.chip, borderColor: theme.chipBorder }}
        >
          <ServiceTypeIcon type={service.type} size={11} />
          {service.type}
        </span>
      </div>
      <div className="mt-[14px] flex items-center justify-between font-mono text-xs">
        <span style={{ color: theme.muted }}>{service.port ? `:${service.port}` : 'no port'}</span>
        <span style={{ color: hasStatus ? color : theme.faint }}>{statusLabel(latestStatus)}</span>
      </div>
    </div>
  )
}
