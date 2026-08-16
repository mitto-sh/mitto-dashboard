export type ThemeMode = 'bone' | 'graphite'

export interface StatusPalette {
  live: string
  building: string
  pushing: string
  provisioning: string
  failed: string
  queued: string
  cancelled: string
}

export interface Theme {
  canvas: string
  headerBg: string
  surface: string
  raised: string
  panel: string
  chip: string
  chipBorder: string
  border: string
  subtle: string
  line: string
  dashed: string
  ink: string
  ink2: string
  sec: string
  muted: string
  faint: string
  accent: string
  accentHover: string
  accentInk: string
  danger: string
  dangerBorder: string
  dangerBg: string
  overlay: string
  cardDrag: string
  shadowCard: string
  shadowDrag: string
  panelShadow: string
  connStroke: string
  connDot: string
  status: StatusPalette
}

export const BONE_THEME: Theme = {
  canvas: '#F4F2ED',
  headerBg: 'rgba(251,250,247,0.92)',
  surface: '#FBFAF7',
  raised: '#F1EFE9',
  panel: '#FDFCFA',
  chip: '#ECE9E2',
  chipBorder: '#D3CEC2',
  border: '#D8D3C8',
  subtle: '#E7E3DA',
  line: '#E2DED4',
  dashed: '#CFCABE',
  ink: '#1E2126',
  ink2: '#3A3F47',
  sec: '#5C6470',
  muted: '#8B9099',
  faint: '#A7A399',
  accent: '#0FA893',
  accentHover: '#12BCA4',
  accentInk: '#FFFFFF',
  danger: '#DE3B30',
  dangerBorder: 'rgba(222,59,48,0.35)',
  dangerBg: 'rgba(222,59,48,0.06)',
  overlay: 'rgba(45,41,33,0.35)',
  cardDrag: '#FFFFFF',
  shadowCard: '0 8px 24px rgba(46,42,32,0.10)',
  shadowDrag: '0 16px 48px rgba(46,42,32,0.22)',
  panelShadow: 'rgba(46,42,32,0.12)',
  connStroke: 'rgba(15,168,147,0.35)',
  connDot: 'rgba(15,168,147,0.55)',
  status: {
    live: '#1FA45B',
    building: '#C88A16',
    pushing: '#C88A16',
    provisioning: '#C88A16',
    failed: '#DE3B30',
    queued: '#6E7787',
    cancelled: '#8B9099',
  },
}

export const GRAPHITE_THEME: Theme = {
  canvas: '#262624',
  headerBg: 'rgba(38,38,36,0.92)',
  surface: '#30302E',
  raised: '#383735',
  panel: '#2B2A28',
  chip: '#3A3937',
  chipBorder: '#4A4845',
  border: '#45433F',
  subtle: '#3A3835',
  line: '#403E3A',
  dashed: '#514E48',
  ink: '#ECEAE4',
  ink2: '#D6D3CC',
  sec: '#A8A49C',
  muted: '#87847C',
  faint: '#5C594F',
  accent: '#3DD6C4',
  accentHover: '#5EE8D8',
  accentInk: '#0A2622',
  danger: '#FF6459',
  dangerBorder: 'rgba(255,100,89,0.35)',
  dangerBg: 'rgba(255,100,89,0.08)',
  overlay: 'rgba(15,14,12,0.6)',
  cardDrag: '#383735',
  shadowCard: '0 8px 24px rgba(0,0,0,0.3)',
  shadowDrag: '0 16px 48px rgba(0,0,0,0.5)',
  panelShadow: 'rgba(0,0,0,0.35)',
  connStroke: 'rgba(61,214,196,0.3)',
  connDot: 'rgba(61,214,196,0.5)',
  status: {
    live: '#46E08C',
    building: '#F0B441',
    pushing: '#F0B441',
    provisioning: '#F0B441',
    failed: '#FF6459',
    queued: '#8A94A6',
    cancelled: '#87847C',
  },
}

export const THEMES: Record<ThemeMode, Theme> = { bone: BONE_THEME, graphite: GRAPHITE_THEME }

const THEME_KEY = 'mitto_theme'

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'bone'
  const stored = window.localStorage.getItem(THEME_KEY)
  return stored === 'graphite' ? 'graphite' : 'bone'
}

export function storeTheme(mode: ThemeMode): void {
  window.localStorage.setItem(THEME_KEY, mode)
}

export function statusColorFor(theme: Theme, status: keyof StatusPalette | null | undefined): string {
  return status ? theme.status[status] : theme.faint
}

export function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex}${a}`
}
