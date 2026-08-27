'use client'

import { useEffect, useRef } from 'react'
import { useDeploymentLogs } from '@/lib/useDeploymentLogs'

interface LogViewerProps {
  deploymentId: string
}

export function LogViewer({ deploymentId }: LogViewerProps) {
  const lines = useDeploymentLogs(deploymentId)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [lines.length])

  return (
    <div className="mt-[10px] max-h-[220px] overflow-y-auto rounded-[10px] border border-line bg-canvas p-[10px_12px] font-mono text-caption text-ink-secondary">
      {lines.length === 0 ? (
        <p className="text-ink-faint">Waiting for logs…</p>
      ) : (
        lines.map((entry, i) => (
          <p key={i} className={entry.type === 'build' ? 'text-ink-secondary' : 'text-ink'}>
            {entry.line}
          </p>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  )
}
