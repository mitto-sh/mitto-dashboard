import { describe, it, expect } from 'vitest'
import { EN, ES, DICTIONARIES, getStoredLang, storeLang } from '@/lib/i18n'

describe('i18n', () => {
  it('exposes both dictionaries keyed by language, with matching keys', () => {
    expect(DICTIONARIES.en).toBe(EN)
    expect(DICTIONARIES.es).toBe(ES)
    expect(Object.keys(EN).sort()).toEqual(Object.keys(ES).sort())
  })

  it('defaults to English when nothing is stored', () => {
    expect(getStoredLang()).toBe('en')
  })

  it('persists and reloads the chosen language', () => {
    storeLang('es')
    expect(getStoredLang()).toBe('es')
    storeLang('en')
    expect(getStoredLang()).toBe('en')
  })

  it('ignores a corrupted stored value and falls back to English', () => {
    window.localStorage.setItem('mitto_lang', 'fr')
    expect(getStoredLang()).toBe('en')
  })
})
