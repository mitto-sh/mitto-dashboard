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

/**
 * Bridges this app's own Bone/Graphite `Theme` objects to CSS custom
 * properties so components can consume colors as Tailwind classes instead of
 * pulling the `theme` object out of `useThemeContext()` for static lookups.
 * Two layers, both written to `document.documentElement` by `ThemeProvider`:
 *
 * 1. shadcn-semantic vars (`--background`, `--foreground`, `--card`, ...) —
 *    what `ui/*` components (button, dialog, command, ...) already read.
 *    `--accent`/`--accent-foreground` intentionally map to a neutral hover
 *    background (shadcn's own meaning for that token), not the brand teal
 *    `theme.accent` — that one lives on `--primary` instead.
 * 2. raw Bone/Graphite token vars (`--raised`, `--chip-border`, `--sec`, ...)
 *    — a 1:1 mirror of every `Theme` field, for everything that doesn't have
 *    a natural shadcn-semantic equivalent (or where reusing one would be
 *    more confusing than a dedicated var, e.g. `theme.sec` vs shadcn's own
 *    `--muted-foreground`).
 */
export function cssVarsFor(theme: Theme): Record<string, string> {
  return {
    // shadcn-semantic layer
    '--background': theme.canvas,
    '--foreground': theme.ink,
    '--card': theme.surface,
    '--card-foreground': theme.ink,
    '--popover': theme.raised,
    '--popover-foreground': theme.ink,
    '--primary': theme.accent,
    '--primary-foreground': theme.accentInk,
    '--secondary': theme.chip,
    '--secondary-foreground': theme.ink2,
    '--muted': theme.chip,
    '--muted-foreground': theme.muted,
    '--accent': theme.raised,
    '--accent-foreground': theme.ink,
    '--destructive': theme.danger,
    '--destructive-foreground': theme.accentInk,
    '--border': theme.border,
    '--input': theme.border,
    '--ring': theme.accent,

    // raw Bone/Graphite token layer
    '--canvas': theme.canvas,
    '--header-bg': theme.headerBg,
    '--surface': theme.surface,
    '--raised': theme.raised,
    '--panel': theme.panel,
    '--chip': theme.chip,
    '--chip-border': theme.chipBorder,
    '--subtle': theme.subtle,
    '--line': theme.line,
    '--dashed': theme.dashed,
    '--ink': theme.ink,
    '--ink-2': theme.ink2,
    '--sec': theme.sec,
    '--faint': theme.faint,
    '--primary-hover': theme.accentHover,
    '--danger-border': theme.dangerBorder,
    '--danger-bg': theme.dangerBg,
    '--overlay': theme.overlay,
    '--card-drag': theme.cardDrag,
    '--shadow-card': theme.shadowCard,
    '--shadow-drag': theme.shadowDrag,
    '--shadow-modal': `0 24px 64px ${theme.panelShadow}`,
    '--primary-glow': `0 0 24px ${theme.accent}80`,
    '--login-radial-glow': `radial-gradient(ellipse at center, ${theme.accent}22, transparent 65%)`,
    '--conn-stroke': theme.connStroke,
    '--conn-dot': theme.connDot,
    '--status-live': theme.status.live,
    '--status-building': theme.status.building,
    '--status-pushing': theme.status.pushing,
    '--status-provisioning': theme.status.provisioning,
    '--status-failed': theme.status.failed,
    '--status-queued': theme.status.queued,
    '--status-cancelled': theme.status.cancelled,
  }
}
