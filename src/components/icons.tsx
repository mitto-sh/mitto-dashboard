interface IconProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

function Icon({ d, size = 14, className, style, strokeWidth = 2 }: IconProps & { d: string; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

export function GlobeIcon(props: IconProps) {
  return <Icon {...props} d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
}

export function SettingsIcon(props: IconProps) {
  return (
    <Icon
      {...props}
      d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0"
    />
  )
}

export function ClockIcon(props: IconProps) {
  return <Icon {...props} d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M12 6v6l4 2" />
}

export function FileTextIcon(props: IconProps) {
  return (
    <Icon
      {...props}
      d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2zM14 2v5a1 1 0 0 0 1 1h5M10 9H8M16 13H8M16 17H8"
    />
  )
}

export function PlusIcon(props: IconProps) {
  return <Icon {...props} d="M5 12h14M12 5v14" strokeWidth={2.5} />
}

export function XIcon(props: IconProps) {
  return <Icon {...props} d="M18 6 6 18M6 6l12 12" />
}

export function RocketIcon(props: IconProps) {
  return (
    <Icon
      {...props}
      d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"
    />
  )
}

export function Trash2Icon(props: IconProps) {
  return (
    <Icon
      {...props}
      d="M10 11v6M14 11v6M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
    />
  )
}

export function ArrowRightIcon(props: IconProps) {
  return <Icon {...props} d="M5 12h14m-7-7 7 7-7 7" />
}

export function ArrowLeftIcon(props: IconProps) {
  return <Icon {...props} d="M19 12H5m7 7-7-7 7-7" />
}

export function SunIcon(props: IconProps) {
  return <Icon {...props} d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0" />
}

export function MoonIcon(props: IconProps) {
  return <Icon {...props} d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
}

const TYPE_ICONS = {
  web: GlobeIcon,
  worker: SettingsIcon,
  cron: ClockIcon,
  static: FileTextIcon,
} as const

export function ServiceTypeIcon({ type, ...props }: IconProps & { type: keyof typeof TYPE_ICONS }) {
  const Component = TYPE_ICONS[type]
  return <Component {...props} />
}
