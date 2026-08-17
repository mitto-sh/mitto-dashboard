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
import { validateProjectForm } from '@/lib/validation'
import type { Project } from '@/lib/types'

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

  const inputStyle = { borderColor: theme.border, backgroundColor: theme.surface, color: theme.ink }
  const labelStyle = { color: theme.muted }

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

      <main className="mx-auto max-w-[560px] px-6 py-12">
        <Link
          href={`/projects/${projectId}`}
          className="mb-6 inline-flex items-center gap-[6px] font-mono text-xs transition-colors"
          style={{ color: theme.muted }}
        >
          <ArrowLeftIcon size={12} />
          Back to project
        </Link>

        <h2 className="mb-6 text-xl font-semibold tracking-tight" style={{ color: theme.ink }}>Project settings</h2>

        <form onSubmit={handleSave} className="mb-10 rounded-xl border p-6" style={{ borderColor: theme.line, backgroundColor: theme.surface }}>
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
          {nameError && <p className="mb-4 text-xs" style={{ color: theme.danger }}>{nameError}</p>}
          {!nameError && <p className="mb-6 mt-1 font-mono text-xs" style={{ color: theme.muted }}>renaming updates the slug too</p>}

          <label className="mb-5 flex items-center justify-between text-sm" style={{ color: theme.ink }}>
            <span>
              Private
              <span className="ml-2 font-mono text-xs" style={{ color: theme.faint }}>(reserved for future team features)</span>
            </span>
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} aria-label="Private" />
          </label>

          <label className="mb-2 flex items-center justify-between text-sm" style={{ color: theme.ink }}>
            Enabled
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} aria-label="Enabled" />
          </label>
          {!enabled && (
            <p className="mb-5 font-mono text-xs" style={{ color: theme.muted }}>new deployments will be blocked while disabled</p>
          )}

          {saveError && <p className="mb-4 text-xs" style={{ color: theme.danger }}>{saveError}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded-lg px-[18px] py-[9px] text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: theme.accent, color: theme.accentInk }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <div className="rounded-xl border p-6" style={{ borderColor: theme.dangerBorder }}>
          <h3 className="mb-1 text-sm font-semibold" style={{ color: theme.ink }}>Danger zone</h3>
          <p className="mb-4 text-xs" style={{ color: theme.muted }}>
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
