'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { useThemeContext } from './ThemeProvider'
import type { Project } from '@/lib/types'

interface DeleteProjectDialogProps {
  project: Project
  onCancel: () => void
  onDeleted: () => void
}

export function DeleteProjectDialog({ project, onCancel, onDeleted }: DeleteProjectDialogProps) {
  const { theme } = useThemeContext()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      await api.deleteProject(project.id)
      onDeleted()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete project')
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[4px]"
      style={{ backgroundColor: theme.overlay }}
    >
      <div
        className="w-[380px] rounded-[14px] border p-6"
        style={{ borderColor: theme.border, backgroundColor: theme.surface, boxShadow: `0 24px 64px ${theme.panelShadow}` }}
      >
        <h2 className="mb-2 text-[15px] font-semibold" style={{ color: theme.ink }}>Delete project</h2>
        <p className="mb-5 text-sm" style={{ color: theme.sec }}>
          Delete <strong>{project.name}</strong> and all its services? This can't be undone.
        </p>
        {error && <p className="mb-3 text-xs" style={{ color: theme.danger }}>{error}</p>}
        <div className="flex justify-end gap-[10px]">
          <button
            onClick={onCancel}
            className="rounded-lg px-[14px] py-[9px] text-sm font-medium transition-colors"
            style={{ color: theme.sec }}
          >
            Keep project
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg px-[18px] py-[9px] text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: theme.danger, color: theme.accentInk }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
