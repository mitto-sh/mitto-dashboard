const HUES = [165, 210, 265, 320, 30, 60]

function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

export function identityColor(name: string): string {
  const hue = HUES[hashString(name) % HUES.length]
  return `oklch(0.58 0.12 ${hue})`
}

export function initialFor(name: string): string {
  return name.trim()[0]?.toUpperCase() ?? '?'
}
