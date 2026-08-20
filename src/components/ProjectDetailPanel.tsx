'use client'

import { useEffect, useState } from 'react'
import { EntityPanel, type EntityPanelTab } from './EntityPanel'
import { DeleteProjectDialog } from './DeleteProjectDialog'
import { ToggleSwitch } from './ToggleSwitch'
import { Trash2Icon } from './icons'
import { useThemeContext } from './ThemeProvider'
import { api } from '@/lib/api'
import { validateProjectForm, slugify } from '@/lib/validation'
import { identityColor, initialFor } from '@/lib/identity'
import { formatRelativeTime } from '@/lib/time'
import type { Project } from '@/lib/types'

interface ProjectDetailPanelProps {
  project: Project
  open: boolean
  tab: EntityPanelTab
  onTabChange: (tab: EntityPanelTab) => void
  onClose: () => void
  onProjectUpdated: (project: Project) => void
  onDeleted: () => void
}

export function ProjectDetailPanel({
  project,
  open,
  tab,
  onTabChange,
  onClose,
  onProjectUpdated,
  onDeleted,
}: ProjectDetailPanelProps) {
  const { theme } = useThemeContext()
  const [name, setName] = useState(project.name)
  const [isPrivate, setIsPrivate] = useState(project.isPrivate)
  const [enabled, setEnabled] = useState(project.enabled)
  const [nameError, setNameError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    setName(project.name)
    setIsPrivate(project.isPrivate)
    setEnabled(project.enabled)
  }, [project.id, project.name, project.isPrivate, project.enabled])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const result = validateProjectForm(name)
    if (!result.valid || !result.data) {
      setNameError(result.error ?? 'Invalid name')
      return
    }
    setNameError(null)
    setSaveError(null)
    setSaving(true)
    try {
      const updated = await api.updateProject(project.id, { name: result.data.name, isPrivate, enabled })
      onProjectUpdated(updated)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = { borderColor: theme.border, backgroundColor: theme.canvas, color: theme.ink }
  const labelStyle = { color: theme.sec }
  const slugPreview = slugify(name)

  return (
    <>
      <EntityPanel
        open={open}
        onOpenChange={(next) => { if (!next) onClose() }}
        title={project.name}
        tab={tab}
        onTabChange={onTabChange}
        overviewLabel="Overview"
        settingsLabel="Settings"
        meta={
          <div className="mt-3 flex items-center gap-3">
            <div
              className="flex h-9 w-9 flex-none items-center justify-center rounded-[9px] font-mono text-sm font-semibold text-white"
              style={{ backgroundColor: identityColor(project.name) }}
            >
              {initialFor(project.name)}
            </div>
            <p className="font-mono text-body-sm" style={{ color: theme.sec }}>
              {project.region} · created {formatRelativeTime(project.createdAt)}
            </p>
          </div>
        }
        overview={
          <div className="px-7 py-5">
            <h3 className="mb-3 font-mono text-label font-medium uppercase tracking-[0.08em]" style={{ color: theme.sec }}>
              Domain
            </h3>
            <div
              className="flex items-center justify-between rounded-lg border px-[14px] py-[10px]"
              style={{ borderColor: theme.line, backgroundColor: theme.raised }}
            >
              <span className="font-mono text-body-sm" style={{ color: theme.ink2 }}>{slugify(project.name)}.mitto.app</span>
              <span className="font-mono text-label uppercase tracking-[0.06em]" style={{ color: theme.sec }}>default</span>
            </div>
          </div>
        }
        settings={
          <div className="px-7 py-5">
            <form onSubmit={handleSave}>
              <label className="mb-[6px] block font-mono text-label uppercase tracking-[0.08em]" style={labelStyle} htmlFor="project-name">
                Name
              </label>
              <input
                id="project-name"
                className="mb-1 w-full rounded-lg border px-3 py-[9px] text-sm outline-none transition-colors"
                style={inputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {nameError ? (
                <p className="mt-1 text-xs" style={{ color: theme.danger }}>{nameError}</p>
              ) : (
                <p className="mt-1 font-mono text-label" style={{ color: theme.sec }}>slug → {slugPreview}</p>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-body-sm" style={{ color: theme.ink }}>Private</p>
                  <p className="mt-[2px] font-mono text-label" style={{ color: theme.sec }}>reserved for future team features</p>
                </div>
                <ToggleSwitch checked={isPrivate} onChange={() => setIsPrivate((v) => !v)} label="Toggle private" />
              </div>
              <div className="mt-[18px] flex items-center justify-between">
                <div>
                  <p className="text-body-sm" style={{ color: theme.ink }}>Enabled</p>
                  <p className="mt-[2px] font-mono text-label" style={{ color: theme.sec }}>new deployments are blocked while disabled</p>
                </div>
                <ToggleSwitch checked={enabled} onChange={() => setEnabled((v) => !v)} label="Toggle enabled" />
              </div>

              {saveError && <p className="mt-4 text-xs" style={{ color: theme.danger }}>{saveError}</p>}

              <button
                type="submit"
                disabled={saving}
                className="mt-6 rounded-lg px-5 py-[10px] text-body-sm font-semibold transition-colors disabled:opacity-50"
                style={{ backgroundColor: theme.accent, color: theme.accentInk }}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>

            <div className="mt-8 rounded-xl border p-[18px]" style={{ borderColor: theme.dangerBorder }}>
              <h3 className="mb-1 text-sm font-semibold" style={{ color: theme.ink }}>Danger zone</h3>
              <p className="mb-4 text-xs" style={{ color: theme.sec }}>
                Deleting a project also deletes all of its services and deployment history.
              </p>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="inline-flex items-center gap-[6px] rounded-lg border px-4 py-2 text-body-sm font-medium transition-colors"
                style={{ borderColor: theme.dangerBorder, color: theme.danger }}
              >
                <Trash2Icon size={13} />
                Delete project
              </button>
            </div>
          </div>
        }
      />

      {showDeleteDialog && (
        <DeleteProjectDialog
          project={project}
          onCancel={() => setShowDeleteDialog(false)}
          onDeleted={onDeleted}
        />
      )}
    </>
  )
}
