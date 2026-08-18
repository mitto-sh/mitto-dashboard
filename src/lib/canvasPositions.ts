export interface Position {
  x: number
  y: number
}

const CARD_WIDTH = 240
const CARD_GAP_X = 60
const CARD_GAP_Y = 40
const COLUMNS = 3

function storageKey(projectId: string): string {
  return `mitto_canvas_positions_${projectId}`
}

export function defaultPosition(index: number): Position {
  const col = index % COLUMNS
  const row = Math.floor(index / COLUMNS)
  return {
    x: col * (CARD_WIDTH + CARD_GAP_X) + 40,
    y: row * (160 + CARD_GAP_Y) + 40,
  }
}

export function loadPositions(projectId: string): Record<string, Position> {
  if (typeof window === 'undefined') return {}

  const raw = window.localStorage.getItem(storageKey(projectId))
  if (!raw) return {}

  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

export function savePosition(projectId: string, serviceId: string, position: Position): void {
  const positions = loadPositions(projectId)
  positions[serviceId] = position
  window.localStorage.setItem(storageKey(projectId), JSON.stringify(positions))
}

export function resolvePosition(
  projectId: string,
  serviceId: string,
  fallbackIndex: number,
  stored: Record<string, Position>,
): Position {
  return stored[serviceId] ?? defaultPosition(fallbackIndex)
}
