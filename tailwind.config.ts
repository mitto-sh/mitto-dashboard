import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Raw Bone/Graphite token layer — driven by the CSS vars ThemeProvider
        // keeps in sync with lib/theme.ts (see cssVarsFor's 2nd layer). Names
        // mirror the `Theme` interface's own field names 1:1.
        canvas: 'var(--canvas)',
        headerBg: 'var(--header-bg)',
        surface: 'var(--surface)',
        raised: 'var(--raised)',
        panel: 'var(--panel)',
        chip: 'var(--chip)',
        border: { DEFAULT: 'var(--border)', subtle: 'var(--subtle)', chip: 'var(--chip-border)' },
        line: 'var(--line)',
        // named dashedBorder, not `dashed` — `border-dashed` is already
        // Tailwind's built-in border-style utility, would collide
        dashedBorder: 'var(--dashed)',
        ink: { DEFAULT: 'var(--ink)', 2: 'var(--ink-2)', secondary: 'var(--sec)', muted: 'var(--muted-foreground)', faint: 'var(--faint)' },
        danger: { DEFAULT: 'var(--destructive)', border: 'var(--danger-border)', bg: 'var(--danger-bg)' },
        overlay: 'var(--overlay)',
        cardDrag: 'var(--card-drag)',
        conn: { stroke: 'var(--conn-stroke)', dot: 'var(--conn-dot)' },
        status: {
          live: 'var(--status-live)',
          building: 'var(--status-building)',
          pushing: 'var(--status-pushing)',
          provisioning: 'var(--status-provisioning)',
          failed: 'var(--status-failed)',
          queued: 'var(--status-queued)',
          cancelled: 'var(--status-cancelled)',
        },
        // shadcn/ui tokens — driven by CSS vars that ThemeProvider keeps in
        // sync with lib/theme.ts's Bone/Graphite palettes (see cssVarsFor)
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
        primary: { DEFAULT: 'var(--primary)', hover: 'var(--primary-hover)', foreground: 'var(--primary-foreground)' },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        // neutral hover background for menu/list items (shadcn semantics) —
        // distinct from the brand teal (`theme.accent`), which lives on `primary` above
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
        destructive: { DEFAULT: 'var(--destructive)', foreground: 'var(--destructive-foreground)' },
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        // Secondary-text scale — change these once instead of hunting every
        // text-[Npx] arbitrary value across components.
        label: '12px',    // mono uppercase section labels, chip/badge text
        caption: '13px',  // secondary hints, mono technical values
        'body-sm': '14px', // small body copy
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        drag: 'var(--shadow-drag)',
        modal: 'var(--shadow-modal)',
        glow: 'var(--primary-glow)',
      },
      keyframes: {
        dotPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.6' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        dotPulse: 'dotPulse 1.6s ease-in-out infinite',
        glowPulse: 'glowPulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
