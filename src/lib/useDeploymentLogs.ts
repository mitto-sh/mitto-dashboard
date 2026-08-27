import { useEffect, useState } from 'react'
import { api } from './api'

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL ?? 'ws://localhost:4104'

export interface LogLine {
  type: 'build' | 'runtime'
  line: string
}

export function useDeploymentLogs(deploymentId: string | undefined): LogLine[] {
  const [lines, setLines] = useState<LogLine[]>([])

  useEffect(() => {
    setLines([])
    if (!deploymentId) return

    let socket: WebSocket | undefined
    let cancelled = false

    api.getLogsToken(deploymentId).then(({ token }) => {
      if (cancelled) return
      socket = new WebSocket(`${REALTIME_URL}/deployments/${deploymentId}/logs?token=${token}`)
      socket.onmessage = (event) => {
        try {
          setLines((prev) => [...prev, JSON.parse(event.data) as LogLine])
        } catch {}
      }
    }).catch(() => {})

    return () => {
      cancelled = true
      socket?.close()
    }
  }, [deploymentId])

  return lines
}
