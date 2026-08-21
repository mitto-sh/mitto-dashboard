'use client'

import { useEffect, useState } from 'react'
import { EntityPanel, type EntityPanelTab } from './EntityPanel'
import { DeleteProjectDialog } from './DeleteProjectDialog'
import { CreateEnvironmentModal } from './CreateEnvironmentModal'
import { ToggleSwitch } from './ToggleSwitch'
import { Trash2Icon, PlusIcon, CheckIcon, XIcon } from './icons'
import { useThemeContext } from './ThemeProvider'
import { api } from '@/lib/api'
import { validateProjectForm, validateEnvironmentForm, slugify } from '@/lib/validation'
import { identityColor, initialFor } from '@/lib/identity'
import { formatRelativeTime } from '@/lib/time'
import type { Project, Environment } from '@/lib/types'

interface ProjectDetailPanelProps {
  project: Project
  open: boolean
  tab: EntityPanelTab
  onTabChange: (tab: EntityPanelTab) => void
  onClose: () => void
  onProjectUpdated: (project: Project) => void
  onDeleted: () => void
  environments: Environment[]
  onEnvironmentCreated: (environment: Environment) => void
  onEnvironmentUpdated: (environment: Environment) => void
  onEnvironmentDeleted: (id: string) => void
}

const inputClassName = 'rounded-lg border border-border bg-canvas text-ink outline-none transition-colors'

export function ProjectDetailPanel({
  project,
  open,
  tab,
  onTabChange,
  onClose,
  onProjectUpdated,
  onDeleted,
  environments,
  onEnvironmentCreated,
  onEnvironmentUpdated,
  onEnvironmentDeleted,
}: ProjectDetailPanelProps) {
  const { dict } = useThemeContext()
  const [name, setName] = useState(project.name)
  const [isPrivate, setIsPrivate] = useState(project.isPrivate)
  const [enabled, setEnabled] = useState(project.enabled)
  const [nameError, setNameError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [createEnvOpen, setCreateEnvOpen] = useState(false)
  const [editingEnvId, setEditingEnvId] = useState<string | null>(null)
  const [editEnvName, setEditEnvName] = useState('')
  const [confirmDeleteEnvId, setConfirmDeleteEnvId] = useState<string | null>(null)
  const [envError, setEnvError] = useState<string | null>(null)

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

  async function handleCreateEnvironment(data: { name: string }) {
    const environment = await api.createEnvironment({ projectId: project.id, name: data.name })
    onEnvironmentCreated(environment)
    setCreateEnvOpen(false)
  }

  function startEditEnvironment(environment: Environment) {
    setEditingEnvId(environment.id)
    setEditEnvName(environment.name)
    setEnvError(null)
  }

  async function handleSaveEnvironment(environment: Environment) {
    const result = validateEnvironmentForm(editEnvName)
    if (!result.valid || !result.data) {
      setEnvError(result.error ?? 'Invalid name')
      return
    }
    try {
      const updated = await api.updateEnvironment(environment.id, { name: result.data.name })
      onEnvironmentUpdated(updated)
      setEditingEnvId(null)
      setEnvError(null)
    } catch (e) {
      setEnvError(e instanceof Error ? e.message : 'Failed to rename environment')
    }
  }

  async function handleDeleteEnvironment(environment: Environment) {
    if (confirmDeleteEnvId !== environment.id) {
      setConfirmDeleteEnvId(environment.id)
      return
    }
    try {
      await api.deleteEnvironment(environment.id)
      onEnvironmentDeleted(environment.id)
      setConfirmDeleteEnvId(null)
    } catch (e) {
      setEnvError(e instanceof Error ? e.message : 'Failed to delete environment')
      setConfirmDeleteEnvId(null)
    }
  }

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
            <p className="font-mono text-body-sm text-ink-secondary">
              {project.region} · created {formatRelativeTime(project.createdAt)}
            </p>
          </div>
        }
        overview={
          <div className="px-7 py-5">
            <h3 className="mb-3 font-mono text-label font-medium uppercase tracking-[0.08em] text-ink-secondary">
              Domain
            </h3>
            <div className="flex items-center justify-between rounded-lg border border-line bg-raised px-[14px] py-[10px]">
              <span className="font-mono text-body-sm text-ink-2">{slugify(project.name)}.mitto.app</span>
              <span className="font-mono text-label uppercase tracking-[0.06em] text-ink-secondary">default</span>
            </div>
          </div>
        }
        settings={
          <div className="px-7 py-5">
            <form onSubmit={handleSave}>
              <label className="mb-[6px] block font-mono text-label uppercase tracking-[0.08em] text-ink-secondary" htmlFor="project-name">
                Name
              </label>
              <input
                id="project-name"
                className={`mb-1 w-full px-3 py-[9px] text-sm ${inputClassName}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {nameError ? (
                <p className="mt-1 text-xs text-destructive">{nameError}</p>
              ) : (
                <p className="mt-1 font-mono text-label text-ink-secondary">slug → {slugPreview}</p>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-body-sm text-ink">Private</p>
                  <p className="mt-[2px] font-mono text-label text-ink-secondary">reserved for future team features</p>
                </div>
                <ToggleSwitch checked={isPrivate} onChange={() => setIsPrivate((v) => !v)} label="Toggle private" />
              </div>
              <div className="mt-[18px] flex items-center justify-between">
                <div>
                  <p className="text-body-sm text-ink">Enabled</p>
                  <p className="mt-[2px] font-mono text-label text-ink-secondary">new deployments are blocked while disabled</p>
                </div>
                <ToggleSwitch checked={enabled} onChange={() => setEnabled((v) => !v)} label="Toggle enabled" />
              </div>

              {saveError && <p className="mt-4 text-xs text-destructive">{saveError}</p>}

              <button
                type="submit"
                disabled={saving}
                className="mt-6 rounded-lg bg-primary px-5 py-[10px] text-body-sm font-semibold text-primary-foreground transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>

            <div className="mt-8">
              <h3 className="mb-3 font-mono text-label font-medium uppercase tracking-[0.08em] text-ink-secondary">
                {dict.environments}
              </h3>
              <ul className="mb-3 overflow-hidden rounded-[10px] border border-line">
                {environments.map((env) => (
                  <li
                    key={env.id}
                    className="flex items-center gap-[10px] border-b border-border-subtle bg-surface p-[11px_14px] last:border-b-0"
                  >
                    {editingEnvId === env.id ? (
                      <>
                        <input
                          autoFocus
                          value={editEnvName}
                          onChange={(e) => setEditEnvName(e.target.value)}
                          className={`flex-1 rounded-md px-2 py-1 text-body-sm ${inputClassName}`}
                        />
                        <button
                          onClick={() => handleSaveEnvironment(env)}
                          aria-label="Save environment name"
                          className="inline-flex p-[2px] text-primary"
                        >
                          <CheckIcon size={14} />
                        </button>
                        <button
                          onClick={() => { setEditingEnvId(null); setEnvError(null) }}
                          aria-label="Cancel rename"
                          className="inline-flex p-[2px] text-ink-muted"
                        >
                          <XIcon size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditEnvironment(env)}
                          className="flex-1 truncate text-left font-mono text-body-sm font-medium text-ink-2"
                        >
                          {env.name}
                        </button>
                        {env.isDefault && (
                          <span className="font-mono text-label uppercase tracking-[0.06em] text-ink-secondary">default</span>
                        )}
                        <button
                          onClick={() => handleDeleteEnvironment(env)}
                          aria-label={confirmDeleteEnvId === env.id ? dict.confirmDelete : 'Remove environment'}
                          className={`inline-flex items-center gap-[4px] p-[2px] text-caption ${confirmDeleteEnvId === env.id ? 'text-destructive' : 'text-ink-muted'}`}
                        >
                          {confirmDeleteEnvId === env.id ? dict.confirmDelete : <Trash2Icon size={13} />}
                        </button>
                        {confirmDeleteEnvId === env.id && (
                          <button
                            onClick={() => setConfirmDeleteEnvId(null)}
                            aria-label="Cancel delete"
                            className="inline-flex p-[2px] text-ink-muted"
                          >
                            <XIcon size={13} />
                          </button>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
              {envError && <p className="mb-3 text-xs text-destructive">{envError}</p>}
              <button
                onClick={() => setCreateEnvOpen(true)}
                className="inline-flex items-center gap-[6px] rounded-lg border border-border-chip bg-chip px-3 py-[7px] text-body-sm text-ink-secondary transition-colors"
              >
                <PlusIcon size={13} />
                {dict.addEnvironment}
              </button>
            </div>

            <div className="mt-8 rounded-xl border border-danger-border p-[18px]">
              <h3 className="mb-1 text-sm font-semibold text-ink">Danger zone</h3>
              <p className="mb-4 text-xs text-ink-secondary">
                Deleting a project also deletes all of its services and deployment history.
              </p>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="inline-flex items-center gap-[6px] rounded-lg border border-danger-border px-4 py-2 text-body-sm font-medium text-danger transition-colors"
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

      {createEnvOpen && (
        <CreateEnvironmentModal
          onCancel={() => setCreateEnvOpen(false)}
          onCreate={handleCreateEnvironment}
        />
      )}
    </>
  )
}
