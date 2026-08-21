'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useThemeContext } from './ThemeProvider'
import { isAuthenticated } from '@/lib/auth'
import { SunIcon, MoonIcon } from './icons'

export function ThemeLangToggle() {
  const { mode, toggleTheme, lang, toggleLang } = useThemeContext()
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    setAuthed(isAuthenticated())
  }, [pathname])

  // Authenticated pages show theme/language in the header's UserMenu instead.
  if (authed) return null

  return (
    <div className="fixed bottom-4 left-4 z-30 flex items-center gap-[10px]">
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-ink-secondary transition-colors"
      >
        {mode === 'graphite' ? <SunIcon size={13} /> : <MoonIcon size={13} />}
      </button>
      <button
        onClick={toggleLang}
        aria-label="Toggle language"
        className="inline-flex h-7 items-center justify-center rounded-lg border border-border bg-surface px-[10px] font-mono text-label text-ink-secondary transition-colors"
      >
        {lang === 'es' ? 'EN' : 'ES'}
      </button>
    </div>
  )
}
