'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useThemeContext } from './ThemeProvider'
import { MoreHorizontalIcon, LockIcon, GlobeIcon, SettingsIcon, ServiceTypeIcon } from './icons'
import { formatRelativeTime } from '@/lib/time'
import { identityColor, initialFor } from '@/lib/identity'
import type { Project } from '@/lib/types'

interface ProjectCardProps {
  project: Project
  onRequestDelete: (project: Project) => void
}

export function ProjectCard({ project, onRequestDelete }: ProjectCardProps) {
  const { theme } = useThemeContext()
  const [menuOpen, setMenuOpen] = useState(false)

  const services = project.services ?? []
  const serviceCount = services.length
  const visibleIcons = services.slice(0, 3)
  const serviceCountLabel =
    serviceCount > 3
      ? `+${serviceCount - 3} more`
      : `${serviceCount} ${serviceCount === 1 ? 'service' : 'services'}`

  return (
    <div
      className="group relative rounded-xl border p-5 transition-all duration-150 hover:-translate-y-[2px]"
      style={{ borderColor: theme.line, backgroundColor: theme.surface, boxShadow: 'none' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = theme.shadowCard }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
    >
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
              <span className="truncate text-sm font-medium" style={{ color: theme.ink }}>{project.name}</span>
              {!project.enabled && (
                <span
                  className="flex-none rounded-[5px] border px-[6px] py-[1px] font-mono text-[9px] font-medium uppercase tracking-[0.08em]"
                  style={{ color: theme.danger, borderColor: theme.dangerBorder, backgroundColor: theme.dangerBg }}
                >
                  disabled
                </span>
              )}
            </div>
            <span className="truncate font-mono text-xs" style={{ color: theme.muted }}>{project.slug}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-[6px]">
          {visibleIcons.map((service) => (
            <span
              key={service.id}
              className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border"
              style={{ backgroundColor: theme.chip, borderColor: theme.chipBorder, color: theme.sec }}
            >
              <ServiceTypeIcon type={service.type} size={11} />
            </span>
          ))}
          <span className="font-mono text-[11px]" style={{ color: theme.faint }}>{serviceCountLabel}</span>
        </div>

        <div
          className="mt-[14px] flex items-center gap-2 border-t pt-3 font-mono text-[11px]"
          style={{ borderColor: theme.subtle, color: theme.muted }}
        >
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

      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setMenuOpen((prev) => !prev)
        }}
        aria-label="Project actions"
        className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-lg opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        style={{ color: theme.muted, backgroundColor: menuOpen ? theme.chip : 'transparent' }}
      >
        <MoreHorizontalIcon size={15} />
      </button>

      {menuOpen && (
        <>
          <button
            aria-label="Close menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute right-4 top-12 z-20 w-40 overflow-hidden rounded-lg border py-1"
            style={{ borderColor: theme.border, backgroundColor: theme.raised, boxShadow: `0 8px 24px ${theme.panelShadow}` }}
          >
            <Link
              href={`/projects/${project.id}/settings`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
              style={{ color: theme.ink }}
            >
              <SettingsIcon size={13} />
              Settings
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false)
                onRequestDelete(project)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors"
              style={{ color: theme.danger }}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
