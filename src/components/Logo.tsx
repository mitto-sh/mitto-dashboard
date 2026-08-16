'use client'

import { useThemeContext } from './ThemeProvider'

interface LogoProps {
  size?: number
  glow?: boolean
  className?: string
}

export function Logo({ size = 11, glow = false, className = '' }: LogoProps) {
  const { theme } = useThemeContext()

  return (
    <span
      className={`inline-block flex-none rotate-45 rounded-[2.5px] ${glow ? 'animate-glowPulse' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: theme.accent,
        boxShadow: glow ? `0 0 24px ${theme.accent}80` : undefined,
      }}
    />
  )
}
