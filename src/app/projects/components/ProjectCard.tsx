'use client'

import Link from 'next/link'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DisabledBadge } from '@/components/ui/disabled-badge'
import { MoreHorizontalIcon, LockIcon, GlobeIcon, SettingsIcon, ServiceTypeIcon } from '@/components/icons'
import { formatRelativeTime } from '@/lib/time'
import { identityColor, initialFor } from '@/lib/identity'
import type { Project } from '@/lib/types'

interface ProjectCardProps {
  project: Project
  onRequestDelete: (project: Project) => void
  onRequestSettings: (project: Project) => void
}

export function ProjectCard({ project, onRequestDelete, onRequestSettings }: ProjectCardProps) {
  const services = project.services ?? []
  const serviceCount = services.length
  const visibleIcons = services.slice(0, 3)
  const serviceCountLabel =
    serviceCount > 3
      ? `+${serviceCount - 3} more`
      : `${serviceCount} ${serviceCount === 1 ? 'service' : 'services'}`

  return (
    <div className="group relative rounded-xl border border-line bg-surface p-5 shadow-none transition-all duration-150 hover:-translate-y-[2px] hover:shadow-card">
      <Link href={`/projects/${project.id}`} className="block">
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 flex-none items-center justify-center rounded-[9px] font-mono text-sm font-semibold text-white"
            style={{ backgroundColor: identityColor(project.name) }}
          >
            {initialFor(project.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-ink">{project.name}</span>
              {!project.enabled && <DisabledBadge />}
            </div>
            <span className="truncate font-mono text-xs text-ink-muted">{project.slug}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-[6px]">
          {visibleIcons.map((service) => (
            <span
              key={service.id}
              className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border border-border-chip bg-chip text-ink-secondary"
            >
              <ServiceTypeIcon type={service.type} size={11} />
            </span>
          ))}
          <span className="font-mono text-label text-ink-faint">{serviceCountLabel}</span>
        </div>

        <div className="mt-[14px] flex items-center gap-2 border-t border-border-subtle pt-3 font-mono text-label text-ink-muted">
          <span className="inline-flex items-center gap-1">
            {project.isPrivate ? <LockIcon size={11} /> : <GlobeIcon size={11} />}
            {project.isPrivate ? 'Private' : 'Public'}
          </span>
          <span>·</span>
          <span>{project.region}</span>
          <span>·</span>
          <span>{formatRelativeTime(project.createdAt)}</span>
        </div>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
            aria-label="Project actions"
            className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100"
          >
            <MoreHorizontalIcon size={15} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onRequestSettings(project)}>
            <SettingsIcon size={13} />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => onRequestDelete(project)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
