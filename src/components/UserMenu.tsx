'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useThemeContext } from './ThemeProvider'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { SunIcon, MoonIcon } from './icons'
import { clearToken } from '@/lib/auth'
import { api } from '@/lib/api'
import { identityColor, initialFor } from '@/lib/identity'
import type { User } from '@/lib/types'

export function UserMenu() {
  const { mode, toggleTheme, lang, toggleLang } = useThemeContext()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    api.me().then(setUser).catch(() => {})
  }, [])

  function handleSignOut() {
    clearToken()
    router.push('/login')
  }

  const displayName = user?.name || user?.email || '?'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="User menu"
        className="h-8 w-8 flex-none overflow-hidden rounded-full border border-border bg-raised transition-colors"
      >
        {user?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center font-mono text-xs font-semibold text-white"
            style={{ backgroundColor: identityColor(displayName) }}
          >
            {initialFor(displayName)}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={toggleTheme} aria-label="Toggle theme">
          {mode === 'graphite' ? <SunIcon size={13} /> : <MoonIcon size={13} />}
          <span className="flex-1">Theme</span>
          <span className="font-mono text-xs text-muted-foreground">{mode === 'graphite' ? 'Dark' : 'Light'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={toggleLang} aria-label="Toggle language">
          <span className="flex-1">Language</span>
          <span className="font-mono text-xs text-muted-foreground">{lang === 'es' ? 'ES' : 'EN'}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
