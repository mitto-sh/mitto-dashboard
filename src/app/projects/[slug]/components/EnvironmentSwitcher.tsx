'use client'

import { useThemeContext } from '@/components/ThemeProvider'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PlusIcon, SettingsIcon } from '@/components/icons'
import type { Environment } from '@/lib/types'

interface EnvironmentSwitcherProps {
  environments: Environment[]
  selected: Environment | null
  onSelect: (environment: Environment) => void
  onCreateNew: () => void
  onManage: () => void
}

function envDotClass(slug: string): string {
  if (slug === 'production') return 'bg-destructive'
  if (slug === 'dev' || slug === 'qa') return 'bg-primary'
  return 'bg-ink-secondary'
}

export function EnvironmentSwitcher({ environments, selected, onSelect, onCreateNew, onManage }: EnvironmentSwitcherProps) {
  const { dict } = useThemeContext()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={dict.environment}
        title={selected?.name}
        className="inline-flex h-8 w-[140px] flex-none items-center gap-[7px] rounded-lg border border-border bg-surface px-[10px] text-body-sm text-ink transition-colors"
      >
        {selected && <span className={`h-[7px] w-[7px] flex-none rounded-full ${envDotClass(selected.slug)}`} />}
        <span className="min-w-0 flex-1 truncate text-left">{selected?.name ?? '—'}</span>
        <span className="flex-none text-ink-faint">▾</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        {environments.map((env) => (
          <DropdownMenuItem
            key={env.id}
            onSelect={() => onSelect(env)}
            aria-label={env.name}
            className={selected?.id === env.id ? 'text-ink font-semibold' : undefined}
          >
            <span className={`h-[7px] w-[7px] flex-none rounded-full ${envDotClass(env.slug)}`} />
            <span className="flex-1">{env.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onCreateNew} aria-label={dict.newEnvironment}>
          <PlusIcon size={13} />
          <span className="flex-1">{dict.newEnvironment}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onManage} aria-label={dict.manageEnvironments}>
          <SettingsIcon size={13} />
          <span className="flex-1">{dict.manageEnvironments}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
