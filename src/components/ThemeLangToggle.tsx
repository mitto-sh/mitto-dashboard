'use client'

import { useThemeContext } from './ThemeProvider'
import { SunIcon, MoonIcon } from './icons'

export function ThemeLangToggle() {
  const { theme, mode, toggleTheme, lang, toggleLang } = useThemeContext()

  return (
    <div className="fixed bottom-4 left-4 z-30 flex items-center gap-[10px]">
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-colors"
        style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.sec }}
      >
        {mode === 'graphite' ? <SunIcon size={13} /> : <MoonIcon size={13} />}
      </button>
      <button
        onClick={toggleLang}
        aria-label="Toggle language"
        className="inline-flex h-7 items-center justify-center rounded-lg border px-[10px] font-mono text-[11px] transition-colors"
        style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.sec }}
      >
        {lang === 'es' ? 'EN' : 'ES'}
      </button>
    </div>
  )
}
