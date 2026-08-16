'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useThemeContext } from './ThemeProvider'
import type { GithubInstallation, GithubRepo, MittoServiceConfig, Project } from '@/lib/types'

interface ImportFromGithubModalProps {
  onCancel: () => void
  onImported: (project: Project) => void
}

type Step =
  | { name: 'loading-installations' }
  | { name: 'no-installations' }
  | { name: 'pick-installation'; installations: GithubInstallation[] }
  | { name: 'pick-repo'; installation: GithubInstallation; repos: GithubRepo[] }
  | { name: 'confirm'; installation: GithubInstallation; repo: GithubRepo; detected: MittoServiceConfig[] }
  | { name: 'importing' }
  | { name: 'error'; message: string }

export function ImportFromGithubModal({ onCancel, onImported }: ImportFromGithubModalProps) {
  const { theme } = useThemeContext()
  const [step, setStep] = useState<Step>({ name: 'loading-installations' })
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.listGithubInstallations()
      .then((installations) => {
        setStep(
          installations.length === 0
            ? { name: 'no-installations' }
            : { name: 'pick-installation', installations },
        )
      })
      .catch((e) => setStep({ name: 'error', message: e instanceof Error ? e.message : 'Failed to load' }))
  }, [])

  async function handleConnectGithub() {
    const { url } = await api.githubInstallUrl()
    window.location.href = url
  }

  async function handleSelectInstallation(installation: GithubInstallation) {
    try {
      const repos = await api.listInstallationRepos(installation.installationId)
      setStep({ name: 'pick-repo', installation, repos })
    } catch (e) {
      setStep({ name: 'error', message: e instanceof Error ? e.message : 'Failed to load repos' })
    }
  }

  async function handleSelectRepo(installation: GithubInstallation, repo: GithubRepo) {
    const [owner, name] = repo.full_name.split('/')
    try {
      const result = await api.getRepoConfig(installation.installationId, owner!, name!)
      const detected = result.found && result.valid ? result.config.services : []
      setStep({ name: 'confirm', installation, repo, detected })
    } catch (e) {
      setStep({ name: 'error', message: e instanceof Error ? e.message : 'Failed to read repo config' })
    }
  }

  async function handleImport(repo: GithubRepo, detected: MittoServiceConfig[]) {
    setStep({ name: 'importing' })
    try {
      const project = await api.createProject({ name: repo.name, repoUrl: repo.html_url })
      for (const svc of detected) {
        await api.createService({ projectId: project.id, name: svc.name, type: svc.type, port: svc.port })
      }
      onImported(project)
    } catch (e) {
      setStep({ name: 'error', message: e instanceof Error ? e.message : 'Import failed' })
    }
  }

  const cardStyle = { borderColor: theme.border, backgroundColor: theme.surface }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-[4px]"
      style={{ backgroundColor: theme.overlay }}
    >
      <div
        className="flex max-h-[560px] w-[440px] flex-col rounded-[14px] border p-6"
        style={{ ...cardStyle, boxShadow: `0 24px 64px ${theme.panelShadow}` }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold" style={{ color: theme.ink }}>Import from GitHub</h2>
          <button onClick={onCancel} className="text-sm" style={{ color: theme.muted }}>✕</button>
        </div>

        {step.name === 'loading-installations' && (
          <p className="font-mono text-xs" style={{ color: theme.muted }}>Loading…</p>
        )}

        {step.name === 'no-installations' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <p className="text-sm" style={{ color: theme.sec }}>No GitHub connections yet.</p>
            <button
              onClick={handleConnectGithub}
              className="rounded-lg px-[18px] py-[9px] text-sm font-semibold"
              style={{ backgroundColor: theme.accent, color: theme.accentInk }}
            >
              Connect GitHub
            </button>
          </div>
        )}

        {step.name === 'pick-installation' && (
          <ul className="flex flex-col gap-2 overflow-y-auto">
            {step.installations.map((inst) => (
              <li key={inst.id}>
                <button
                  onClick={() => handleSelectInstallation(inst)}
                  className="w-full rounded-lg border px-4 py-3 text-left text-sm"
                  style={{ borderColor: theme.line, backgroundColor: theme.raised, color: theme.ink }}
                >
                  {inst.accountLogin}
                  <span className="ml-2 font-mono text-xs" style={{ color: theme.muted }}>{inst.accountType}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {step.name === 'pick-repo' && (
          <div className="flex flex-col overflow-hidden">
            <input
              aria-label="Filter repositories"
              placeholder="Filter repositories…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="mb-3 rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: theme.border, backgroundColor: theme.canvas, color: theme.ink }}
            />
            <ul className="flex flex-col gap-2 overflow-y-auto">
              {step.repos
                .filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()))
                .map((repo) => (
                  <li key={repo.id}>
                    <button
                      onClick={() => handleSelectRepo(step.installation, repo)}
                      className="w-full rounded-lg border px-4 py-3 text-left text-sm"
                      style={{ borderColor: theme.line, backgroundColor: theme.raised, color: theme.ink }}
                    >
                      {repo.name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {step.name === 'confirm' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: theme.ink }}>
              Import <strong>{step.repo.full_name}</strong>?
            </p>
            {step.detected.length > 0 ? (
              <div className="rounded-lg border p-3" style={{ borderColor: theme.line }}>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em]" style={{ color: theme.muted }}>
                  Detected from mitto.yaml
                </p>
                <ul className="flex flex-col gap-1">
                  {step.detected.map((s) => (
                    <li key={s.name} className="font-mono text-xs" style={{ color: theme.ink2 }}>
                      {s.name} — {s.type}{s.port ? ` :${s.port}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="font-mono text-xs" style={{ color: theme.muted }}>
                No mitto.yaml found — you can add services after importing.
              </p>
            )}
            <div className="flex justify-end gap-[10px]">
              <button onClick={onCancel} className="rounded-lg px-[14px] py-[9px] text-sm" style={{ color: theme.sec }}>
                Cancel
              </button>
              <button
                onClick={() => handleImport(step.repo, step.detected)}
                className="rounded-lg px-[18px] py-[9px] text-sm font-semibold"
                style={{ backgroundColor: theme.accent, color: theme.accentInk }}
              >
                Import
              </button>
            </div>
          </div>
        )}

        {step.name === 'importing' && (
          <p className="font-mono text-xs" style={{ color: theme.muted }}>Importing…</p>
        )}

        {step.name === 'error' && (
          <p className="text-xs" style={{ color: theme.danger }}>{step.message}</p>
        )}
      </div>
    </div>
  )
}
