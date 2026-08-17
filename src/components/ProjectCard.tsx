'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useThemeContext } from './ThemeProvider'
import { MoreHorizontalIcon, LockIcon, GlobeIcon, SettingsIcon } from './icons'
import { formatRelativeTime } from '@/lib/time'
import type { Project } from '@/lib/types'

interface ProjectCardProps {
  project: Project
  onRequestDelete: (project: Project) => void
}

export function ProjectCard({ project, onRequestDelete }: ProjectCardProps) {
  const { theme } = useThemeContext()
  const [menuOpen, setMenuOpen] = useState(false)

  const serviceCount = project.services?.length ?? 0

  return (
    <div
      className="group relative rounded-xl border p-5 transition-colors"
      style={{ borderColor: theme.line, backgroundColor: theme.surface }}
    >
      <Link href={`/projects/${project.id}`} className="block">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
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

        <div className="mt-4 flex items-center gap-3 font-mono text-[11px]" style={{ color: theme.muted }}>
          <span className="inline-flex items-center gap-1">
            {project.isPrivate ? <LockIcon size={11} /> : <GlobeIcon size={11} />}
            {project.isPrivate ? 'Private' : 'Public'}
          </span>
          <span>·</span>
          <span>{serviceCount} {serviceCount === 1 ? 'service' : 'services'}</span>
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
