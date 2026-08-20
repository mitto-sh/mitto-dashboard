'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthGuard } from '@/components/AuthGuard'
import { AppHeader } from '@/components/AppHeader'
import { SearchIcon, PlusIcon } from '@/components/icons'
import { CreateProjectModal } from '@/components/CreateProjectModal'
import { DeleteProjectDialog } from '@/components/DeleteProjectDialog'
import { ProjectCard } from '@/components/ProjectCard'
import { ProjectDetailPanel } from '@/components/ProjectDetailPanel'
import { CommandPalette } from '@/components/CommandPalette'
import type { EntityPanelTab } from '@/components/EntityPanel'
import { useThemeContext } from '@/components/ThemeProvider'
import { api } from '@/lib/api'
import type { Project } from '@/lib/types'

const GITHUB_ERROR_MESSAGES: Record<string, string> = {
  missing_params: 'GitHub did not send back the expected parameters. Try connecting again.',
  invalid_state: 'That GitHub connection link expired or was invalid. Try connecting again.',
}

function GithubStatusBanner() {
  const { theme } = useThemeContext()
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
      <p className="mb-6 rounded-lg border px-4 py-[10px] text-caption" style={{ borderColor: theme.line, backgroundColor: theme.raised, color: theme.sec }}>
        GitHub connected. You can now import repositories.
      </p>
    )
  }
  if (errorCode) {
    return (
      <p className="mb-6 rounded-lg border px-4 py-[10px] text-caption" style={{ borderColor: theme.dangerBorder, backgroundColor: theme.dangerBg, color: theme.danger }}>
        {GITHUB_ERROR_MESSAGES[errorCode] ?? 'Something went wrong connecting GitHub.'}
      </p>
    )
  }
  return null
}

function ProjectsList() {
  const { theme } = useThemeContext()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [settingsProject, setSettingsProject] = useState<Project | null>(null)
  const [settingsTab, setSettingsTab] = useState<EntityPanelTab>('settings')

  useEffect(() => {
    api.listProjects().then((data) => {
      setProjects(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
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

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) || p.slug.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div>
      <AppHeader
        actions={
          <>
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-[8px] rounded-lg border px-[10px] py-[9px] font-mono text-xs transition-colors sm:inline-flex"
              style={{ borderColor: theme.border, backgroundColor: theme.surface, color: theme.muted }}
            >
              <SearchIcon size={13} />
              Jump to…
              <span
                className="rounded-[4px] border px-[5px] py-[1px] text-label"
                style={{ borderColor: theme.chipBorder, backgroundColor: theme.chip }}
              >
                ⌘K
              </span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-[6px] rounded-lg px-[14px] py-[7px] text-body-sm font-semibold transition-colors"
              style={{ backgroundColor: theme.accent, color: theme.accentInk }}
            >
              <PlusIcon size={13} />
              New project
            </button>
          </>
        }
      />

      <main className="mx-auto max-w-[1040px] px-6 py-12">
        <div className="mb-6 flex items-baseline gap-3">
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: theme.ink }}>Projects</h1>
          <span className="font-mono text-xs" style={{ color: theme.muted }}>
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
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: theme.muted }}
            />
            <input
              aria-label="Search projects"
              placeholder="Search projects…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border py-[10px] pl-9 pr-3 text-sm outline-none transition-colors"
              style={{ borderColor: theme.border, backgroundColor: theme.surface, color: theme.ink }}
            />
          </div>
        </div>

        {loading ? (
          <p className="font-mono text-sm" style={{ color: theme.muted }}>Loading…</p>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed p-[48px_24px] text-center" style={{ borderColor: theme.border }}>
            <p className="text-sm" style={{ color: theme.sec }}>No projects yet</p>
            <p className="mt-2 font-mono text-xs" style={{ color: theme.muted }}>create one above to get started</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="font-mono text-sm" style={{ color: theme.muted }}>No projects match "{query}"</p>
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

      <CommandPalette projects={projects} open={paletteOpen} onOpenChange={setPaletteOpen} />

      {settingsProject && (
        <ProjectDetailPanel
          project={settingsProject}
          open
          tab={settingsTab}
          onTabChange={setSettingsTab}
          onClose={() => setSettingsProject(null)}
          onProjectUpdated={handleProjectUpdated}
          onDeleted={handleProjectDeletedFromSettings}
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
