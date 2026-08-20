import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0A0C10',
        surface: '#12151B',
        raised: '#151A23',
        chip: '#1A202B',
        border: { DEFAULT: '#232936', subtle: '#1C212B', chip: '#262D3A' },
        ink: { DEFAULT: '#E6EAF2', secondary: '#98A2B3', muted: '#5D6878', faint: '#3C4552' },
        status: {
          live: '#46E08C',
          building: '#F0B441',
          failed: '#FF6459',
          queued: '#8A94A6',
          cancelled: '#5D6878',
        },
        // shadcn/ui tokens — driven by CSS vars that ThemeProvider keeps in
        // sync with lib/theme.ts's Bone/Graphite palettes (see cssVarsFor)
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
        primary: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-foreground)' },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        // neutral hover background for menu/list items (shadcn semantics) —
        // distinct from the brand teal, which stays JS-driven via theme.ts/theme.accent
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
