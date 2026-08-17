'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/AuthGuard'
import { Logo } from '@/components/Logo'
import { DeleteProjectDialog } from '@/components/DeleteProjectDialog'
import { ArrowLeftIcon, Trash2Icon } from '@/components/icons'
import { useThemeContext } from '@/components/ThemeProvider'
import { api } from '@/lib/api'
import { validateProjectForm, slugify } from '@/lib/validation'
import { identityColor, initialFor } from '@/lib/identity'
import { formatRelativeTime } from '@/lib/time'
import type { Project } from '@/lib/types'
import type { Theme } from '@/lib/theme'

function ToggleSwitch({ checked, onChange, label, theme }: { checked: boolean; onChange: () => void; label: string; theme: Theme }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="box-border inline-flex h-5 w-9 flex-none items-center rounded-full p-[2px] transition-colors"
      style={{ backgroundColor: checked ? theme.accent : theme.border }}
    >
      <span
        className="block h-4 w-4 rounded-full bg-white transition-transform"
        style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  )
}

function ProjectSettingsView({ projectId }: { projectId: string }) {
  const router = useRouter()
  const { theme } = useThemeContext()
  const [project, setProject] = useState<Project | null>(null)
  const [name, setName] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [enabled, setEnabled] = useState(true)
  const [nameError, setNameError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    api.getProject(projectId).then((p) => {
      setProject(p)
      setName(p.name)
      setIsPrivate(p.isPrivate)
      setEnabled(p.enabled)
    }).catch(() => {})
  }, [projectId])

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
      const updated = await api.updateProject(projectId, { name: result.data.name, isPrivate, enabled })
      setProject(updated)
      setName(updated.name)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (!project) {
    return <p className="p-6 font-mono text-sm" style={{ color: theme.muted }}>Loading…</p>
  }

  const inputStyle = { borderColor: theme.border, backgroundColor: theme.canvas, color: theme.ink }
  const labelStyle = { color: theme.muted }
  const cardStyle = { borderColor: theme.line, backgroundColor: theme.surface }
  const slugPreview = slugify(name)

  return (
    <div>
      <header className="flex h-14 items-center border-b px-5" style={{ borderColor: theme.subtle }}>
        <div className="flex items-center gap-[10px]">
          <Link href="/projects" className="flex items-center gap-[10px] transition-colors" style={{ color: theme.muted }}>
            <Logo size={11} />
            <span className="font-mono text-[13px] font-medium" style={{ color: theme.ink }}>mitto</span>
          </Link>
          <span className="font-mono text-[13px]" style={{ color: theme.faint }}>/</span>
          <Link href={`/projects/${projectId}`} className="text-[13px] font-medium transition-colors" style={{ color: theme.muted }}>
            {project.slug}
          </Link>
          <span className="font-mono text-[13px]" style={{ color: theme.faint }}>/</span>
          <h1 className="text-[13px] font-medium" style={{ color: theme.ink }}>Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-[600px] px-6 py-10">
        <Link
          href={`/projects/${projectId}`}
          className="mb-6 inline-flex items-center gap-[6px] font-mono text-xs transition-colors"
          style={{ color: theme.muted }}
        >
          <ArrowLeftIcon size={12} />
          Back to project
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <div
            className="flex h-14 w-14 flex-none items-center justify-center rounded-[14px] font-mono text-[22px] font-semibold text-white"
            style={{ backgroundColor: identityColor(project.name) }}
          >
            {initialFor(project.name)}
          </div>
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight" style={{ color: theme.ink }}>{project.name}</h2>
            <p className="mt-1 font-mono text-[12.5px]" style={{ color: theme.muted }}>
              {project.region} · created {formatRelativeTime(project.createdAt)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="mb-4 rounded-xl border p-[22px]" style={cardStyle}>
            <h3 className="mb-4 text-sm font-semibold" style={{ color: theme.ink }}>General</h3>
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
            {nameError ? (
              <p className="mt-1 text-xs" style={{ color: theme.danger }}>{nameError}</p>
            ) : (
              <p className="mt-1 font-mono text-[11.5px]" style={{ color: theme.faint }}>slug → {slugPreview}</p>
            )}
          </div>

          <div className="mb-4 rounded-xl border p-[22px]" style={cardStyle}>
            <h3 className="mb-1 text-sm font-semibold" style={{ color: theme.ink }}>Domain</h3>
            <p className="mb-4 text-[12.5px]" style={{ color: theme.sec }}>Where this project is reachable.</p>
            <div
              className="mb-[10px] flex items-center justify-between rounded-lg border px-[14px] py-[10px]"
              style={{ borderColor: theme.line, backgroundColor: theme.raised }}
            >
              <span className="font-mono text-[12.5px]" style={{ color: theme.ink2 }}>{slugPreview}.mitto.app</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.06em]" style={{ color: theme.muted }}>default</span>
            </div>
            <div
              className="flex items-center justify-between rounded-lg border border-dashed px-[14px] py-[10px]"
              style={{ borderColor: theme.dashed }}
            >
              <span className="font-mono text-[12.5px]" style={{ color: theme.faint }}>Add a custom domain</span>
              <span
                className="rounded-[5px] border px-[7px] py-[2px] font-mono text-[9.5px] font-medium uppercase tracking-[0.06em]"
                style={{ backgroundColor: theme.chip, borderColor: theme.chipBorder, color: theme.muted }}
              >
                coming soon
              </span>
            </div>
          </div>

          <div className="mb-4 rounded-xl border p-[22px]" style={cardStyle}>
            <h3 className="mb-4 text-sm font-semibold" style={{ color: theme.ink }}>Visibility</h3>
            <div className="mb-[18px] flex items-center justify-between">
              <div>
                <p className="text-[13.5px]" style={{ color: theme.ink }}>Private</p>
                <p className="mt-[2px] font-mono text-[11.5px]" style={{ color: theme.faint }}>reserved for future team features</p>
              </div>
              <ToggleSwitch checked={isPrivate} onChange={() => setIsPrivate((v) => !v)} label="Toggle private" theme={theme} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13.5px]" style={{ color: theme.ink }}>Enabled</p>
                <p className="mt-[2px] font-mono text-[11.5px]" style={{ color: theme.faint }}>new deployments are blocked while disabled</p>
              </div>
              <ToggleSwitch checked={enabled} onChange={() => setEnabled((v) => !v)} label="Toggle enabled" theme={theme} />
            </div>
          </div>

          {saveError && <p className="mb-4 text-xs" style={{ color: theme.danger }}>{saveError}</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg px-5 py-[10px] text-[13.5px] font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: theme.accent, color: theme.accentInk }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <div className="mt-9 rounded-xl border p-[22px]" style={{ borderColor: theme.dangerBorder }}>
          <h3 className="mb-1 text-sm font-semibold" style={{ color: theme.ink }}>Danger zone</h3>
          <p className="mb-4 text-xs" style={{ color: theme.sec }}>
            Deleting a project also deletes all of its services and deployment history.
          </p>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="inline-flex items-center gap-[6px] rounded-lg border px-4 py-2 text-[12.5px] font-medium transition-colors"
            style={{ borderColor: theme.dangerBorder, color: theme.danger }}
          >
            <Trash2Icon size={13} />
            Delete project
          </button>
        </div>
      </main>

      {showDeleteDialog && (
        <DeleteProjectDialog
          project={project}
          onCancel={() => setShowDeleteDialog(false)}
          onDeleted={() => router.push('/projects')}
        />
      )}
    </div>
  )
}

export default function ProjectSettingsPage() {
  const params = useParams<{ id: string }>()

  return (
    <AuthGuard>
      <ProjectSettingsView projectId={params.id} />
    </AuthGuard>
  )
}
