'use client'

import { useRouter } from 'next/navigation'
import { useThemeContext } from './ThemeProvider'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { SunIcon, MoonIcon } from './icons'
import { clearToken } from '@/lib/auth'

export function UserMenu() {
  const { theme, mode, toggleTheme, lang, toggleLang } = useThemeContext()
  const router = useRouter()

  function handleSignOut() {
    clearToken()
    router.push('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="User menu"
        className="h-7 w-7 flex-none rounded-full border transition-colors"
        style={{ borderColor: theme.border, backgroundColor: theme.raised }}
      />
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
