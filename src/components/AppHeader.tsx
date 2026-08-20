'use client'

import Link from 'next/link'
import { Logo } from './Logo'
import { UserMenu } from './UserMenu'
import { useThemeContext } from './ThemeProvider'

interface AppHeaderProps {
  breadcrumb?: React.ReactNode
  actions?: React.ReactNode
}

export function AppHeader({ breadcrumb, actions }: AppHeaderProps) {
  const { theme } = useThemeContext()

  return (
    <header
      className="relative z-20 flex h-14 items-center justify-between border-b px-6"
      style={{ borderColor: theme.subtle, backgroundColor: theme.headerBg }}
    >
      <div className="flex items-center gap-[10px]">
        <Link href="/projects" className="flex items-center gap-[10px] transition-colors" style={{ color: theme.muted }}>
          <Logo size={11} />
          <span className="font-mono text-caption font-medium" style={{ color: theme.ink }}>mitto</span>
        </Link>
        {breadcrumb}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <UserMenu />
      </div>
    </header>
  )
}
