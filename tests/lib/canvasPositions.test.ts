import { describe, it, expect } from 'vitest'
import { defaultPosition, loadPositions, savePosition, resolvePosition } from '@/lib/canvasPositions'

describe('canvasPositions', () => {
  it('lays out cards in a 3-column grid by default', () => {
    expect(defaultPosition(0)).toEqual({ x: 40, y: 40 })
    expect(defaultPosition(1).x).toBeGreaterThan(defaultPosition(0).x)
    expect(defaultPosition(3).y).toBeGreaterThan(defaultPosition(0).y)
    expect(defaultPosition(3).x).toBe(defaultPosition(0).x) // wraps to column 0
  })

  it('returns an empty object when nothing is stored', () => {
    expect(loadPositions('proj-1')).toEqual({})
  })

  it('persists and reloads a position, scoped per project', () => {
    savePosition('proj-1', 'svc-1', { x: 100, y: 200 })
    expect(loadPositions('proj-1')).toEqual({ 'svc-1': { x: 100, y: 200 } })
    expect(loadPositions('proj-2')).toEqual({})
  })

  it('recovers gracefully from corrupted localStorage data', () => {
    window.localStorage.setItem('mitto_canvas_positions_proj-3', 'not json')
    expect(loadPositions('proj-3')).toEqual({})
  })

  it('resolvePosition falls back to the default grid position when unset', () => {
    const stored = {}
    expect(resolvePosition('proj-1', 'svc-unset', 2, stored)).toEqual(defaultPosition(2))
  })

  it('resolvePosition prefers a stored position over the default', () => {
    const stored = { 'svc-1': { x: 5, y: 5 } }
    expect(resolvePosition('proj-1', 'svc-1', 0, stored)).toEqual({ x: 5, y: 5 })
  })
})
