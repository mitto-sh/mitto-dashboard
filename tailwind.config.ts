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
        accent: { DEFAULT: '#3DD6C4', hover: '#5EE8D8', ink: '#062B26' },
        status: {
          live: '#46E08C',
          building: '#F0B441',
          failed: '#FF6459',
          queued: '#8A94A6',
          cancelled: '#5D6878',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
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
