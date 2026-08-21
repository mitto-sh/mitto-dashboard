interface LogoProps {
  size?: number
  glow?: boolean
  className?: string
}

export function Logo({ size = 11, glow = false, className = '' }: LogoProps) {
  return (
    <span
      className={`inline-block flex-none rotate-45 rounded-[2.5px] bg-primary ${glow ? 'animate-glowPulse shadow-glow' : ''} ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
