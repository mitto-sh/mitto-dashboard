'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Logo } from './Logo'
import { UserMenu } from './UserMenu'
import { CommandPalette } from './CommandPalette'
import { SearchIcon } from './icons'
import { api } from '@/lib/api'
import type { Project } from '@/lib/types'

interface AppHeaderProps {
  breadcrumb?: React.ReactNode
  actions?: React.ReactNode
}

export function AppHeader({ breadcrumb, actions }: AppHeaderProps) {
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
      <header className="relative z-20 flex h-16 items-center justify-between border-b border-border-subtle bg-headerBg px-6">
        <div className="flex items-center gap-[10px]">
          <Link href="/projects" className="flex items-center gap-[10px] text-ink-muted transition-colors">
            <Logo size={11} />
            <span className="font-mono text-body-sm font-medium text-ink">mitto</span>
          </Link>
          {breadcrumb}
        </div>

        <button
          onClick={() => setPaletteOpen(true)}
          className="absolute left-1/2 hidden h-8 w-[360px] -translate-x-1/2 items-center gap-[8px] rounded-lg border border-border bg-surface px-[12px] text-body-sm text-ink-muted transition-colors sm:inline-flex"
        >
          <SearchIcon size={13} />
          <span className="flex-1 text-left">Jump to…</span>
          <span className="rounded-[4px] border border-border-chip bg-chip px-[5px] py-[1px] font-mono text-label">
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
