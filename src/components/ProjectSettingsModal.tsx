'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { validateProjectForm } from '@/lib/validation'
import { useThemeContext } from './ThemeProvider'
import { Trash2Icon } from './icons'
import type { Project } from '@/lib/types'

interface ProjectSettingsModalProps {
  project: Project
  onCancel: () => void
  onUpdated: (project: Project) => void
  onDeleted: () => void
}

export function ProjectSettingsModal({ project, onCancel, onUpdated, onDeleted }: ProjectSettingsModalProps) {
  const { theme } = useThemeContext()
  const [name, setName] = useState(project.name)
  const [isPrivate, setIsPrivate] = useState(project.isPrivate)
  const [enabled, setEnabled] = useState(project.enabled)
  const [nameError, setNameError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const result = validateProjectForm(name)
    if (!result.valid || !result.data) {
      setNameError(result.error ?? 'Invalid name')
      return
    }
    setNameError(null)
    setError(null)
    setSaving(true)
    try {
      const updated = await api.updateProject(project.id, {
        name: result.data.name,
        isPrivate,
        enabled,
      })
      onUpdated(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.deleteProject(project.id)
      onDeleted()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete project')
      setDeleting(false)
    }
  }

  const inputStyle = { borderColor: theme.border, backgroundColor: theme.canvas, color: theme.ink }
  const labelStyle = { color: theme.muted }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-[4px]"
      style={{ backgroundColor: theme.overlay }}
    >
      <form
        onSubmit={handleSave}
        className="w-[400px] rounded-[14px] border p-6"
        style={{ borderColor: theme.border, backgroundColor: theme.surface, boxShadow: `0 24px 64px ${theme.panelShadow}` }}
      >
        <h2 className="mb-5 text-[15px] font-semibold" style={{ color: theme.ink }}>Project settings</h2>

        <label className="mb-[6px] block font-mono text-[11px] uppercase tracking-[0.08em]" style={labelStyle} htmlFor="project-name">
          Name
        </label>
        <input
          id="project-name"
          className="mb-1 w-full rounded-lg border px-3 py-[9px] text-sm outline-none transition-colors"
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {nameError && <p className="mb-3 text-xs" style={{ color: theme.danger }}>{nameError}</p>}
        {!nameError && <p className="mb-4 mt-1 font-mono text-xs" style={{ color: theme.muted }}>renaming updates the slug too</p>}

        <label className="mb-4 flex items-center justify-between text-sm" style={{ color: theme.ink }}>
          Private
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            aria-label="Private"
          />
        </label>

        <label className="mb-5 flex items-center justify-between text-sm" style={{ color: theme.ink }}>
          Enabled
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            aria-label="Enabled"
          />
        </label>
        {!enabled && (
          <p className="-mt-4 mb-5 font-mono text-xs" style={{ color: theme.muted }}>
            new deployments will be blocked while disabled
          </p>
        )}

        {error && <p className="mb-3 text-xs" style={{ color: theme.danger }}>{error}</p>}

        <div className="mb-2 flex justify-end gap-[10px]">
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
            disabled={saving}
            className="rounded-lg px-[18px] py-[9px] text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: theme.accent, color: theme.accentInk }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        <div className="mt-4 border-t pt-4" style={{ borderColor: theme.subtle }}>
          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="inline-flex items-center gap-[6px] rounded-lg border px-4 py-2 text-[12.5px] font-medium transition-colors"
              style={{ borderColor: theme.dangerBorder, color: theme.danger }}
            >
              <Trash2Icon size={13} />
              Delete project
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs" style={{ color: theme.danger }}>
                Delete "{project.name}" and all its services? This can't be undone.
              </p>
              <div className="flex flex-none gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="rounded-lg px-3 py-[6px] text-xs"
                  style={{ color: theme.sec }}
                >
                  Keep project
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg px-3 py-[6px] text-xs font-semibold disabled:opacity-50"
                  style={{ backgroundColor: theme.danger, color: theme.accentInk }}
                >
                  {deleting ? 'Deleting…' : 'Confirm'}
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
