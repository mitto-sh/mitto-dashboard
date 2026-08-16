import { describe, it, expect } from 'vitest'
import {
  BONE_THEME,
  GRAPHITE_THEME,
  THEMES,
  getStoredTheme,
  storeTheme,
  statusColorFor,
  hexWithAlpha,
} from '@/lib/theme'

describe('theme', () => {
  it('exposes both themes keyed by mode', () => {
    expect(THEMES.bone).toBe(BONE_THEME)
    expect(THEMES.graphite).toBe(GRAPHITE_THEME)
  })

  it('defaults to bone when nothing is stored', () => {
    expect(getStoredTheme()).toBe('bone')
  })

  it('persists and reloads the chosen theme', () => {
    storeTheme('graphite')
    expect(getStoredTheme()).toBe('graphite')
    storeTheme('bone')
    expect(getStoredTheme()).toBe('bone')
  })

  it('ignores a corrupted stored value and falls back to bone', () => {
    window.localStorage.setItem('mitto_theme', 'not-a-theme')
    expect(getStoredTheme()).toBe('bone')
  })

  it('resolves a status color from the theme, or faint when unset', () => {
    expect(statusColorFor(BONE_THEME, 'live')).toBe(BONE_THEME.status.live)
    expect(statusColorFor(BONE_THEME, null)).toBe(BONE_THEME.faint)
  })

  it('appends an alpha channel as hex', () => {
    expect(hexWithAlpha('#46E08C', 0.35)).toBe('#46E08C59')
    expect(hexWithAlpha('#000000', 0)).toBe('#00000000')
    expect(hexWithAlpha('#000000', 1)).toBe('#000000ff')
  })
})
