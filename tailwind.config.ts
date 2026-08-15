import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0b0d10',
        surface: '#14171c',
        border: '#242830',
      },
    },
  },
  plugins: [],
} satisfies Config
