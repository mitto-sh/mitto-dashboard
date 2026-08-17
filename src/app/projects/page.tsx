'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthGuard } from '@/components/AuthGuard'
import { Logo } from '@/components/Logo'
import { SearchIcon, ChevronDownIcon, PlusIcon } from '@/components/icons'
import { ImportFromGithubModal } from '@/components/ImportFromGithubModal'
import { CreateProjectModal } from '@/components/CreateProjectModal'
import { DeleteProjectDialog } from '@/components/DeleteProjectDialog'
import { ProjectCard } from '@/components/ProjectCard'
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
      <p className="mb-6 rounded-lg border px-4 py-[10px] text-[13px]" style={{ borderColor: theme.line, backgroundColor: theme.raised, color: theme.sec }}>
        GitHub connected. You can now import repositories.
      </p>
    )
  }
  if (errorCode) {
    return (
      <p className="mb-6 rounded-lg border px-4 py-[10px] text-[13px]" style={{ borderColor: theme.dangerBorder, backgroundColor: theme.dangerBg, color: theme.danger }}>
        {GITHUB_ERROR_MESSAGES[errorCode] ?? 'Something went wrong connecting GitHub.'}
      </p>
    )
  }
  return null
}

function AddNewMenu({ onCreateProject, onImportFromGithub }: { onCreateProject: () => void; onImportFromGithub: () => void }) {
  const { theme } = useThemeContext()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-[6px] rounded-lg px-[16px] py-[10px] text-[13px] font-semibold transition-colors"
        style={{ backgroundColor: theme.accent, color: theme.accentInk }}
      >
        <PlusIcon size={13} />
        Add New…
        <ChevronDownIcon size={13} />
      </button>

      {open && (
        <>
          <button aria-label="Close menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-[calc(100%+6px)] z-20 w-52 overflow-hidden rounded-lg border py-1"
            style={{ borderColor: theme.border, backgroundColor: theme.raised, boxShadow: `0 8px 24px ${theme.panelShadow}` }}
          >
            <button
              onClick={() => { setOpen(false); onCreateProject() }}
              className="block w-full px-3 py-2 text-left text-sm transition-colors"
              style={{ color: theme.ink }}
            >
              Project
            </button>
            <button
              onClick={() => { setOpen(false); onImportFromGithub() }}
              className="block w-full px-3 py-2 text-left text-sm transition-colors"
              style={{ color: theme.ink }}
            >
              Import from GitHub
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function ProjectsList() {
  const { theme } = useThemeContext()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)

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

  async function handleImported() {
    setShowImportModal(false)
    // Services may have landed in a new project or an existing one — simplest
    // to just refresh the list rather than guess which.
    setProjects(await api.listProjects())
  }

  function handleDeleted() {
    setProjects((prev) => prev.filter((p) => p.id !== deletingProject?.id))
    setDeletingProject(null)
  }

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) || p.slug.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div>
      <header className="flex h-14 items-center justify-between border-b px-6" style={{ borderColor: theme.subtle }}>
        <div className="flex items-center gap-[10px]">
          <Logo size={11} />
          <span className="font-mono text-[13px] font-medium" style={{ color: theme.ink }}>mitto</span>
        </div>
        <div className="h-7 w-7 rounded-full border" style={{ borderColor: theme.border, backgroundColor: theme.raised }} />
      </header>

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
          <AddNewMenu
            onCreateProject={() => setShowCreateModal(true)}
            onImportFromGithub={() => setShowImportModal(true)}
          />
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
              <ProjectCard key={p.id} project={p} onRequestDelete={setDeletingProject} />
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateProjectModal onCancel={() => setShowCreateModal(false)} onCreated={handleCreated} />
      )}

      {showImportModal && (
        <ImportFromGithubModal onCancel={() => setShowImportModal(false)} onImported={handleImported} />
      )}

      {deletingProject && (
        <DeleteProjectDialog
          project={deletingProject}
          onCancel={() => setDeletingProject(null)}
          onDeleted={handleDeleted}
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
