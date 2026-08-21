'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Logo } from './Logo'
import { UserMenu } from './UserMenu'
import { CommandPalette } from './CommandPalette'
import { SearchIcon } from './icons'
import { useThemeContext } from './ThemeProvider'
import { api } from '@/lib/api'
import type { Project } from '@/lib/types'

interface AppHeaderProps {
  breadcrumb?: React.ReactNode
  actions?: React.ReactNode
}

export function AppHeader({ breadcrumb, actions }: AppHeaderProps) {
  const { theme } = useThemeContext()
  const [projects, setProjects] = useState<Project[]>([])
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    api.listProjects().then(setProjects).catch(() => {})
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <header
        className="relative z-20 flex h-16 items-center justify-between border-b px-6"
        style={{ borderColor: theme.subtle, backgroundColor: theme.headerBg }}
      >
        <div className="flex items-center gap-[10px]">
          <Link href="/projects" className="flex items-center gap-[10px] transition-colors" style={{ color: theme.muted }}>
            <Logo size={11} />
            <span className="font-mono text-body-sm font-medium" style={{ color: theme.ink }}>mitto</span>
          </Link>
          {breadcrumb}
        </div>

        <button
          onClick={() => setPaletteOpen(true)}
          className="absolute left-1/2 hidden h-8 w-[360px] -translate-x-1/2 items-center gap-[8px] rounded-lg border px-[12px] text-body-sm transition-colors sm:inline-flex"
          style={{ borderColor: theme.border, backgroundColor: theme.surface, color: theme.muted }}
        >
          <SearchIcon size={13} />
          <span className="flex-1 text-left">Jump to…</span>
          <span
            className="rounded-[4px] border px-[5px] py-[1px] font-mono text-label"
            style={{ borderColor: theme.chipBorder, backgroundColor: theme.chip }}
          >
            ⌘K
          </span>
        </button>

        <div className="flex items-center gap-[10px]">
          {actions}
          <UserMenu />
        </div>
      </header>

      <CommandPalette projects={projects} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  )
}
