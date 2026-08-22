'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Modal, ModalActions, ModalCancelButton, ModalSubmitButton } from '@/components/ui/modal'
import type { GithubInstallation, GithubRepo, MittoServiceConfig, Service } from '@/lib/types'

interface ImportFromGithubModalProps {
  projectId: string
  onCancel: () => void
  onImported: (services: Service[]) => void
}

type Step =
  | { name: 'loading-installations' }
  | { name: 'no-installations' }
  | { name: 'pick-installation'; installations: GithubInstallation[] }
  | { name: 'pick-repo'; installation: GithubInstallation; repos: GithubRepo[] }
  | { name: 'confirm'; repo: GithubRepo; detected: MittoServiceConfig[] }
  | { name: 'importing' }
  | { name: 'error'; message: string }

function defaultServiceConfig(repo: GithubRepo): MittoServiceConfig[] {
  return [{ name: repo.name, type: 'web' }]
}

export function ImportFromGithubModal({ projectId, onCancel, onImported }: ImportFromGithubModalProps) {
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
      const detected = result.found && result.valid ? result.config.services : defaultServiceConfig(repo)
      setStep({ name: 'confirm', repo, detected })
    } catch (e) {
      setStep({ name: 'error', message: e instanceof Error ? e.message : 'Failed to read repo config' })
    }
  }

  async function handleImport(repo: GithubRepo, detected: MittoServiceConfig[]) {
    setStep({ name: 'importing' })
    try {
      const created: Service[] = []
      for (const svc of detected) {
        const service = await api.createService({
          projectId,
          name: svc.name,
          type: svc.type,
          port: svc.port,
          repoUrl: repo.html_url,
          repoProvider: 'github',
          defaultBranch: repo.default_branch,
          buildCommand: svc.buildCommand,
          startCommand: svc.startCommand,
          dockerfilePath: svc.dockerfilePath,
        })
        created.push(service)
      }
      onImported(created)
    } catch (e) {
      setStep({ name: 'error', message: e instanceof Error ? e.message : 'Import failed' })
    }
  }

  return (
    <Modal width={440} className="flex max-h-[560px] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-ink">Import from GitHub</h2>
        <button onClick={onCancel} className="text-sm text-ink-muted">✕</button>
      </div>

      {step.name === 'loading-installations' && (
        <p className="font-mono text-xs text-ink-muted">Loading…</p>
      )}

      {step.name === 'no-installations' && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="text-sm text-ink-secondary">No GitHub connections yet.</p>
          <button
            onClick={handleConnectGithub}
            className="rounded-lg bg-primary px-[18px] py-[9px] text-sm font-semibold text-primary-foreground"
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
                className="w-full rounded-lg border border-line bg-raised px-4 py-3 text-left text-sm text-ink"
              >
                {inst.accountLogin}
                <span className="ml-2 font-mono text-xs text-ink-muted">{inst.accountType}</span>
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
            className="mb-3 rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none"
          />
          <ul className="flex flex-col gap-2 overflow-y-auto">
            {step.repos
              .filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()))
              .map((repo) => (
                <li key={repo.id}>
                  <button
                    onClick={() => handleSelectRepo(step.installation, repo)}
                    className="w-full rounded-lg border border-line bg-raised px-4 py-3 text-left text-sm text-ink"
                  >
                    {repo.name}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      {step.name === 'confirm' && (
        <div className="flex flex-col gap-4 overflow-y-auto">
          <p className="text-sm text-ink">
            Importing <strong>{step.repo.full_name}</strong> as:
          </p>
          <div className="rounded-lg border border-line p-3">
            <p className="mb-2 font-mono text-label uppercase tracking-[0.08em] text-ink-muted">
              {step.detected.length > 1 ? 'Services detected (mitto.yaml)' : 'Service'}
            </p>
            <ul className="flex flex-col gap-1">
              {step.detected.map((s) => (
                <li key={s.name} className="font-mono text-xs text-ink-2">
                  {s.name} — {s.type}{s.port ? ` :${s.port}` : ''}
                </li>
              ))}
            </ul>
          </div>

          <ModalActions>
            <ModalCancelButton onClick={onCancel}>Cancel</ModalCancelButton>
            <ModalSubmitButton type="button" onClick={() => handleImport(step.repo, step.detected)}>
              Import
            </ModalSubmitButton>
          </ModalActions>
        </div>
      )}

      {step.name === 'importing' && (
        <p className="font-mono text-xs text-ink-muted">Importing…</p>
      )}

      {step.name === 'error' && (
        <p className="text-xs text-destructive">{step.message}</p>
      )}
    </Modal>
  )
}
