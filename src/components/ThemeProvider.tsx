'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { THEMES, getStoredTheme, storeTheme, type Theme, type ThemeMode } from '@/lib/theme'
import { DICTIONARIES, getStoredLang, storeLang, type Dictionary, type Lang } from '@/lib/i18n'

interface ThemeContextValue {
  mode: ThemeMode
  theme: Theme
  toggleTheme: () => void
  lang: Lang
  dict: Dictionary
  toggleLang: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('bone')
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    setMode(getStoredTheme())
    setLang(getStoredLang())
  }, [])

  function toggleTheme() {
    setMode((prev) => {
      const next = prev === 'graphite' ? 'bone' : 'graphite'
      storeTheme(next)
      return next
    })
  }

  function toggleLang() {
    setLang((prev) => {
      const next = prev === 'es' ? 'en' : 'es'
      storeLang(next)
      return next
    })
  }

  const theme = THEMES[mode]
  const dict = DICTIONARIES[lang]

  return (
    <ThemeContext.Provider value={{ mode, theme, toggleTheme, lang, dict, toggleLang }}>
      <div style={{ backgroundColor: theme.canvas, color: theme.ink, minHeight: '100vh' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeContext must be used within a ThemeProvider')
  return ctx
}
