'use client'

import { useThemeContext } from './ThemeProvider'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { PlusIcon, SettingsIcon } from './icons'
import type { Environment } from '@/lib/types'

interface EnvironmentSwitcherProps {
  environments: Environment[]
  selected: Environment | null
  onSelect: (environment: Environment) => void
  onCreateNew: () => void
  onManage: () => void
}

function envDotColor(theme: ReturnType<typeof useThemeContext>['theme'], slug: string): string {
  if (slug === 'production') return theme.danger
  if (slug === 'dev' || slug === 'qa') return theme.accent
  return theme.sec
}

export function EnvironmentSwitcher({ environments, selected, onSelect, onCreateNew, onManage }: EnvironmentSwitcherProps) {
  const { theme, dict } = useThemeContext()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={dict.environment}
        title={selected?.name}
        className="inline-flex h-8 w-[140px] flex-none items-center gap-[7px] rounded-lg border px-[10px] text-body-sm transition-colors"
        style={{ borderColor: theme.border, color: theme.ink, backgroundColor: theme.surface }}
      >
        {selected && (
          <span
            className="h-[7px] w-[7px] flex-none rounded-full"
            style={{ backgroundColor: envDotColor(theme, selected.slug) }}
          />
        )}
        <span className="min-w-0 flex-1 truncate text-left">{selected?.name ?? '—'}</span>
        <span className="flex-none" style={{ color: theme.faint }}>▾</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        {environments.map((env) => (
          <DropdownMenuItem
            key={env.id}
            onSelect={() => onSelect(env)}
            aria-label={env.name}
            style={selected?.id === env.id ? { color: theme.ink, fontWeight: 600 } : undefined}
          >
            <span
              className="h-[7px] w-[7px] flex-none rounded-full"
              style={{ backgroundColor: envDotColor(theme, env.slug) }}
            />
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
