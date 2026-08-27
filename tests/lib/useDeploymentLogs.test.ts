import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

const getLogsToken = vi.fn()
vi.mock('@/lib/api', () => ({ api: { getLogsToken: (...args: unknown[]) => getLogsToken(...args) } }))

class FakeWebSocket {
  static instances: FakeWebSocket[] = []
  onmessage: ((event: { data: string }) => void) | null = null
  close = vi.fn()
  constructor(public url: string) {
    FakeWebSocket.instances.push(this)
  }
}

beforeEach(() => {
  getLogsToken.mockReset()
  FakeWebSocket.instances = []
  vi.stubGlobal('WebSocket', FakeWebSocket)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useDeploymentLogs', () => {
  it('does nothing when deploymentId is undefined', async () => {
    const { useDeploymentLogs } = await import('@/lib/useDeploymentLogs')
    const { result } = renderHook(() => useDeploymentLogs(undefined))

    expect(result.current).toEqual([])
    expect(getLogsToken).not.toHaveBeenCalled()
  })

  it('fetches a logs token then opens a socket to the realtime URL with it', async () => {
    getLogsToken.mockResolvedValue({ token: 'scoped-token' })
    const { useDeploymentLogs } = await import('@/lib/useDeploymentLogs')
    renderHook(() => useDeploymentLogs('d1'))

    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1))
    expect(getLogsToken).toHaveBeenCalledWith('d1')
    expect(FakeWebSocket.instances[0]!.url).toContain('/deployments/d1/logs?token=scoped-token')
  })

  it('appends parsed messages as they arrive', async () => {
    getLogsToken.mockResolvedValue({ token: 'scoped-token' })
    const { useDeploymentLogs } = await import('@/lib/useDeploymentLogs')
    const { result } = renderHook(() => useDeploymentLogs('d1'))

    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1))
    FakeWebSocket.instances[0]!.onmessage?.({ data: JSON.stringify({ type: 'build', line: 'Step 1/3' }) })

    await waitFor(() => expect(result.current).toEqual([{ type: 'build', line: 'Step 1/3' }]))
  })

  it('closes the socket on unmount', async () => {
    getLogsToken.mockResolvedValue({ token: 'scoped-token' })
    const { useDeploymentLogs } = await import('@/lib/useDeploymentLogs')
    const { unmount } = renderHook(() => useDeploymentLogs('d1'))

    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1))
    unmount()

    expect(FakeWebSocket.instances[0]!.close).toHaveBeenCalled()
  })

  it('resets to an empty list when deploymentId changes', async () => {
    getLogsToken.mockResolvedValue({ token: 'scoped-token' })
    const { useDeploymentLogs } = await import('@/lib/useDeploymentLogs')
    const { result, rerender } = renderHook(({ id }) => useDeploymentLogs(id), { initialProps: { id: 'd1' } })

    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1))
    FakeWebSocket.instances[0]!.onmessage?.({ data: JSON.stringify({ type: 'build', line: 'Step 1/3' }) })
    await waitFor(() => expect(result.current).toHaveLength(1))

    rerender({ id: 'd2' })
    expect(result.current).toEqual([])
  })
})
