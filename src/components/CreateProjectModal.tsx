'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { validateProjectForm } from '@/lib/validation'
import { useThemeContext } from './ThemeProvider'
import type { Project } from '@/lib/types'

interface CreateProjectModalProps {
  onCancel: () => void
  onCreated: (project: Project) => void
}

export function CreateProjectModal({ onCancel, onCreated }: CreateProjectModalProps) {
  const { theme } = useThemeContext()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = validateProjectForm(name)
    if (!result.valid || !result.data) {
      setError(result.error ?? 'Invalid name')
      return
    }
    setError(null)
    setCreating(true)
    try {
      const project = await api.createProject(result.data)
      onCreated(project)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create project')
      setCreating(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-[4px]"
      style={{ backgroundColor: theme.overlay }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-[380px] rounded-[14px] border p-6"
        style={{ borderColor: theme.border, backgroundColor: theme.surface, boxShadow: `0 24px 64px ${theme.panelShadow}` }}
      >
        <h2 className="mb-5 text-[15px] font-semibold" style={{ color: theme.ink }}>New project</h2>

        <label className="mb-[6px] block font-mono text-[11px] uppercase tracking-[0.08em]" style={{ color: theme.muted }} htmlFor="new-project-name">
          Name
        </label>
        <input
          id="new-project-name"
          autoFocus
          placeholder="my-app"
          className="mb-1 w-full rounded-lg border px-3 py-[9px] text-sm outline-none transition-colors"
          style={{ borderColor: theme.border, backgroundColor: theme.canvas, color: theme.ink }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error && <p className="mb-4 mt-1 text-xs" style={{ color: theme.danger }}>{error}</p>}

        <div className="mt-4 flex justify-end gap-[10px]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-[14px] py-[9px] text-sm font-medium transition-colors"
            style={{ color: theme.sec }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg px-[18px] py-[9px] text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: theme.accent, color: theme.accentInk }}
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
