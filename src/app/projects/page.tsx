'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/AuthGuard'
import { Logo } from '@/components/Logo'
import { ArrowRightIcon } from '@/components/icons'
import { ImportFromGithubModal } from '@/components/ImportFromGithubModal'
import { useThemeContext } from '@/components/ThemeProvider'
import { api } from '@/lib/api'
import { validateProjectForm } from '@/lib/validation'
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
      <p className="mb-7 rounded-lg border px-4 py-[10px] text-[13px]" style={{ borderColor: theme.line, backgroundColor: theme.raised, color: theme.sec }}>
        GitHub connected. You can now import repositories.
      </p>
    )
  }
  if (errorCode) {
    return (
      <p className="mb-7 rounded-lg border px-4 py-[10px] text-[13px]" style={{ borderColor: theme.dangerBorder, backgroundColor: theme.dangerBg, color: theme.danger }}>
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
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)

  useEffect(() => {
    api.listProjects().then((data) => {
      setProjects(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const result = validateProjectForm(name)
    if (!result.valid || !result.data) {
      setError(result.error ?? 'Invalid name')
      return
    }
    setError(null)
    const project = await api.createProject(result.data)
    setProjects((prev) => [...prev, project])
    setName('')
  }

  function handleImported(project: Project) {
    setProjects((prev) => [...prev, project])
    setShowImportModal(false)
  }

  return (
    <div>
      <header className="flex h-14 items-center justify-between border-b px-6" style={{ borderColor: theme.subtle }}>
        <div className="flex items-center gap-[10px]">
          <Logo size={11} />
          <span className="font-mono text-[13px] font-medium" style={{ color: theme.ink }}>mitto</span>
        </div>
        <div className="h-7 w-7 rounded-full border" style={{ borderColor: theme.border, backgroundColor: theme.raised }} />
      </header>

      <main className="mx-auto max-w-[720px] px-6 py-14">
        <div className="mb-7 flex items-baseline gap-3">
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: theme.ink }}>Projects</h1>
          <span className="font-mono text-xs" style={{ color: theme.muted }}>
            {loading ? '' : String(projects.length).padStart(2, '0')}
          </span>
        </div>

        <Suspense fallback={null}>
          <GithubStatusBanner />
        </Suspense>

        <form onSubmit={handleCreate} className="mb-3 flex gap-[10px]">
          <input
            aria-label="Project name"
            placeholder="New project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border px-[14px] py-[10px] text-sm outline-none transition-colors"
            style={{ borderColor: theme.border, backgroundColor: theme.surface, color: theme.ink }}
          />
          <button
            type="submit"
            className="rounded-lg px-[18px] py-[10px] text-[13px] font-semibold transition-colors"
            style={{ backgroundColor: theme.accent, color: theme.accentInk }}
          >
            Create
          </button>
        </form>
        <button
          onClick={() => setShowImportModal(true)}
          className="mb-9 rounded-lg border px-[14px] py-[8px] text-[13px] font-medium transition-colors"
          style={{ borderColor: theme.border, color: theme.sec }}
        >
          Import from GitHub
        </button>
        {error && <p className="-mt-7 mb-7 text-xs" style={{ color: theme.danger }}>{error}</p>}

        {loading ? (
          <p className="font-mono text-sm" style={{ color: theme.muted }}>Loading…</p>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed p-[48px_24px] text-center" style={{ borderColor: theme.border }}>
            <p className="text-sm" style={{ color: theme.sec }}>No projects yet</p>
            <p className="mt-2 font-mono text-xs" style={{ color: theme.muted }}>create one above to get started</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-[10px]">
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between rounded-xl border p-[18px_20px] transition-colors"
                  style={{ borderColor: theme.line, backgroundColor: theme.surface }}
                >
                  <div className="flex flex-col gap-[5px]">
                    <span className="text-sm font-medium" style={{ color: theme.ink }}>{p.name}</span>
                    <span className="font-mono text-xs" style={{ color: theme.muted }}>{p.slug}</span>
                  </div>
                  <ArrowRightIcon size={15} style={{ color: theme.faint }} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      {showImportModal && (
        <ImportFromGithubModal onCancel={() => setShowImportModal(false)} onImported={handleImported} />
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
