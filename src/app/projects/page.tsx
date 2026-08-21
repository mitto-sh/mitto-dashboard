'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthGuard } from '@/components/AuthGuard'
import { AppHeader } from '@/components/AppHeader'
import { SearchIcon, PlusIcon } from '@/components/icons'
import { CreateProjectModal } from './components/CreateProjectModal'
import { DeleteProjectDialog } from '@/components/DeleteProjectDialog'
import { ProjectCard } from './components/ProjectCard'
import { ProjectDetailPanel } from '@/components/ProjectDetailPanel'
import type { EntityPanelTab } from '@/components/EntityPanel'
import { api } from '@/lib/api'
import type { Project, Environment } from '@/lib/types'

const GITHUB_ERROR_MESSAGES: Record<string, string> = {
  missing_params: 'GitHub did not send back the expected parameters. Try connecting again.',
  invalid_state: 'That GitHub connection link expired or was invalid. Try connecting again.',
}

function GithubStatusBanner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const connected = searchParams.get('github_connected')
  const errorCode = searchParams.get('github_error')

  useEffect(() => {
    if (connected || errorCode) {
      const timeout = setTimeout(() => router.replace('/projects'), 5000)
      return () => clearTimeout(timeout)
    }
  }, [connected, errorCode, router])

  if (connected) {
    return (
      <p className="mb-6 rounded-lg border border-line bg-raised px-4 py-[10px] text-caption text-ink-secondary">
        GitHub connected. You can now import repositories.
      </p>
    )
  }
  if (errorCode) {
    return (
      <p className="mb-6 rounded-lg border border-danger-border bg-danger-bg px-4 py-[10px] text-caption text-danger">
        {GITHUB_ERROR_MESSAGES[errorCode] ?? 'Something went wrong connecting GitHub.'}
      </p>
    )
  }
  return null
}

function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [settingsProject, setSettingsProject] = useState<Project | null>(null)
  const [settingsTab, setSettingsTab] = useState<EntityPanelTab>('settings')
  const [settingsEnvironments, setSettingsEnvironments] = useState<Environment[]>([])

  useEffect(() => {
    if (!settingsProject) return
    api.listEnvironments(settingsProject.id).then(setSettingsEnvironments).catch(() => setSettingsEnvironments([]))
  }, [settingsProject])

  useEffect(() => {
    api.listProjects().then((data) => {
      setProjects(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function handleCreated(project: Project) {
    setProjects((prev) => [...prev, project])
    setShowCreateModal(false)
  }

  function handleDeleted() {
    setProjects((prev) => prev.filter((p) => p.id !== deletingProject?.id))
    setDeletingProject(null)
  }

  function handleProjectUpdated(updated: Project) {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setSettingsProject(updated)
  }

  function handleProjectDeletedFromSettings() {
    setProjects((prev) => prev.filter((p) => p.id !== settingsProject?.id))
    setSettingsProject(null)
  }

  function handleEnvironmentCreated(env: Environment) {
    setSettingsEnvironments((prev) => [...prev, env])
  }

  function handleEnvironmentUpdated(env: Environment) {
    setSettingsEnvironments((prev) => prev.map((e) => (e.id === env.id ? env : e)))
  }

  function handleEnvironmentDeleted(id: string) {
    setSettingsEnvironments((prev) => prev.filter((e) => e.id !== id))
  }

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) || p.slug.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div>
      <AppHeader
        actions={
          <>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex h-8 items-center gap-[6px] rounded-lg bg-primary px-[14px] text-body-sm font-semibold text-primary-foreground transition-colors"
            >
              <PlusIcon size={13} />
              New project
            </button>
          </>
        }
      />

      <main className="mx-auto max-w-[1040px] px-6 py-12">
        <div className="mb-6 flex items-baseline gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-ink">Projects</h1>
          <span className="font-mono text-xs text-ink-muted">
            {loading ? '' : String(projects.length).padStart(2, '0')}
          </span>
        </div>

        <Suspense fallback={null}>
          <GithubStatusBanner />
        </Suspense>

        <div className="mb-8 flex items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              aria-label="Search projects"
              placeholder="Search projects…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-[10px] pl-9 pr-3 text-sm text-ink outline-none transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <p className="font-mono text-sm text-ink-muted">Loading…</p>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-[48px_24px] text-center">
            <p className="text-sm text-ink-secondary">No projects yet</p>
            <p className="mt-2 font-mono text-xs text-ink-muted">create one above to get started</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="font-mono text-sm text-ink-muted">No projects match "{query}"</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onRequestDelete={setDeletingProject}
                onRequestSettings={(project) => { setSettingsProject(project); setSettingsTab('settings') }}
              />
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateProjectModal onCancel={() => setShowCreateModal(false)} onCreated={handleCreated} />
      )}

      {deletingProject && (
        <DeleteProjectDialog
          project={deletingProject}
          onCancel={() => setDeletingProject(null)}
          onDeleted={handleDeleted}
        />
      )}

      {settingsProject && (
        <ProjectDetailPanel
          project={settingsProject}
          open
          tab={settingsTab}
          onTabChange={setSettingsTab}
          onClose={() => setSettingsProject(null)}
          onProjectUpdated={handleProjectUpdated}
          onDeleted={handleProjectDeletedFromSettings}
          environments={settingsEnvironments}
          onEnvironmentCreated={handleEnvironmentCreated}
          onEnvironmentUpdated={handleEnvironmentUpdated}
          onEnvironmentDeleted={handleEnvironmentDeleted}
        />
      )}
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <AuthGuard>
      <ProjectsList />
    </AuthGuard>
  )
}
