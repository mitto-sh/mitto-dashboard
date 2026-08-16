'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Service, Deployment, EnvVar } from '@/lib/types'
import { statusLabel } from '@/lib/status'
import { statusColorFor } from '@/lib/theme'
import { formatRelativeTime } from '@/lib/time'
import { useThemeContext } from './ThemeProvider'
import { ServiceTypeIcon, XIcon, RocketIcon, Trash2Icon } from './icons'

interface ServiceDetailPanelProps {
  service: Service
  onClose: () => void
  onServiceDeleted: (serviceId: string) => void
  onDeploymentTriggered: (deployment: Deployment) => void
}

const CANCELLABLE = new Set(['queued', 'building', 'pushing', 'provisioning'])

export function ServiceDetailPanel({
  service,
  onClose,
  onServiceDeleted,
  onDeploymentTriggered,
}: ServiceDetailPanelProps) {
  const { theme, dict } = useThemeContext()
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [envVars, setEnvVars] = useState<EnvVar[]>([])
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.listDeployments(service.id).then(setDeployments).catch(() => setDeployments([]))
    api.listEnvVars(service.id).then(setEnvVars).catch(() => setEnvVars([]))
  }, [service.id])

  const latest = deployments[0]
  const color = statusColorFor(theme, latest?.status)

  async function handleDeploy() {
    setBusy(true)
    setError(null)
    try {
      const deployment = await api.triggerDeployment(service.id)
      setDeployments((prev) => [deployment, ...prev])
      onDeploymentTriggered(deployment)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to trigger deployment')
    } finally {
      setBusy(false)
    }
  }

  async function handleCancel() {
    if (!latest) return
    setBusy(true)
    try {
      const updated = await api.cancelDeployment(latest.id)
      setDeployments((prev) => [updated, ...prev.slice(1)])
    } finally {
      setBusy(false)
    }
  }

  async function handleAddEnvVar(e: React.FormEvent) {
    e.preventDefault()
    if (!newKey.trim()) return
    const updated = await api.upsertEnvVars(service.id, [
      { key: newKey.trim(), value: newValue, isSecret: true },
    ])
    setEnvVars((prev) => {
      const withoutKey = prev.filter((v) => v.key !== updated[0]!.key)
      return [...withoutKey, ...updated]
    })
    setNewKey('')
    setNewValue('')
  }

  async function handleDeleteEnvVar(key: string) {
    await api.deleteEnvVar(service.id, key)
    setEnvVars((prev) => prev.filter((v) => v.key !== key))
  }

  async function handleDeleteService() {
    await api.deleteService(service.id)
    onServiceDeleted(service.id)
  }

  return (
    <aside
      className="fixed right-0 top-0 z-30 h-full w-[400px] overflow-y-auto border-l"
      style={{ backgroundColor: theme.panel, borderColor: theme.border, boxShadow: `-32px 0 64px ${theme.panelShadow}` }}
    >
      <div className="border-b p-[22px_24px_18px]" style={{ borderColor: theme.subtle }}>
        <div className="flex items-center gap-[10px]">
          <span className="h-2 w-2 flex-none rounded-full" style={{ backgroundColor: color }} />
          <h2 className="flex-1 text-[16px] font-semibold tracking-tight" style={{ color: theme.ink }}>
            {service.name}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="inline-flex p-1 transition-colors"
            style={{ color: theme.muted }}
          >
            <XIcon size={15} />
          </button>
        </div>
        <p className="ml-[18px] mt-2 flex items-center gap-[6px] font-mono text-xs" style={{ color: theme.muted }}>
          <ServiceTypeIcon type={service.type} size={12} />
          {service.type} · {service.port ? `:${service.port}` : 'no port'}
        </p>
        {service.repoUrl && (
          <a
            href={service.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-[18px] mt-1 block truncate font-mono text-xs hover:underline"
            style={{ color: theme.muted }}
          >
            {service.repoUrl.replace(/^https?:\/\/(www\.)?/, '')} @ {service.defaultBranch}
          </a>
        )}
      </div>

      <section className="p-[22px_24px]">
        <h3 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: theme.muted }}>
          {dict.deployments}
        </h3>
        {latest ? (
          <div
            className="mb-[14px] rounded-[10px] border p-[14px_16px]"
            style={{ borderColor: theme.line, backgroundColor: theme.raised }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[13px] font-medium" style={{ color }}>
                {statusLabel(latest.status)}
              </span>
              <span className="font-mono text-[11px]" style={{ color: theme.muted }}>
                {formatRelativeTime(latest.createdAt)}
              </span>
            </div>
            <p className="mt-[10px] text-[13px]" style={{ color: theme.ink }}>
              {latest.commitMessage ?? 'no commit message'}
            </p>
            {latest.commitSha && (
              <p className="mt-[6px] font-mono text-[11px]" style={{ color: theme.muted }}>{latest.commitSha}</p>
            )}
          </div>
        ) : (
          <div className="mb-[14px] rounded-[10px] border border-dashed p-[18px_16px] text-center" style={{ borderColor: theme.border }}>
            <p className="font-mono text-xs" style={{ color: theme.muted }}>{dict.noDeploys}</p>
          </div>
        )}
        {error && <p className="mb-2 text-xs" style={{ color: theme.danger }}>{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleDeploy}
            disabled={busy}
            className="inline-flex items-center gap-[6px] rounded-lg px-4 py-2 text-[12.5px] font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: theme.accent, color: theme.accentInk }}
          >
            <RocketIcon size={13} />
            {dict.deploy}
          </button>
          {latest && CANCELLABLE.has(latest.status) && (
            <button
              onClick={handleCancel}
              disabled={busy}
              className="rounded-lg border px-4 py-2 text-[12.5px] font-medium transition-colors disabled:opacity-50"
              style={{ borderColor: theme.border, color: theme.sec }}
            >
              {dict.cancel}
            </button>
          )}
        </div>
      </section>

      <section className="p-[6px_24px_22px]">
        <h3 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: theme.muted }}>
          {dict.envVars}
        </h3>
        <ul className="mb-[14px] overflow-hidden rounded-[10px] border" style={{ borderColor: theme.line }}>
          {envVars.map((v) => (
            <li
              key={v.key}
              className="flex items-center gap-[10px] border-b p-[10px_14px] last:border-b-0"
              style={{ borderColor: theme.subtle, backgroundColor: theme.surface }}
            >
              <span className="flex-1 truncate font-mono text-xs font-medium" style={{ color: theme.ink2 }}>{v.key}</span>
              <span className="font-mono text-xs" style={{ color: theme.faint }}>•••••••</span>
              <button
                onClick={() => handleDeleteEnvVar(v.key)}
                aria-label="Remove variable"
                className="inline-flex p-[2px] transition-colors"
                style={{ color: theme.faint }}
              >
                <XIcon size={12} />
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddEnvVar} className="flex gap-2">
          <input
            aria-label="Env var key"
            placeholder="KEY"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value.toUpperCase())}
            className="w-2/5 rounded-lg border px-[10px] py-2 font-mono text-xs outline-none transition-colors"
            style={{ borderColor: theme.border, backgroundColor: theme.canvas, color: theme.ink }}
          />
          <input
            aria-label="Env var value"
            placeholder="value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="flex-1 rounded-lg border px-[10px] py-2 font-mono text-xs outline-none transition-colors"
            style={{ borderColor: theme.border, backgroundColor: theme.canvas, color: theme.ink }}
          />
          <button
            type="submit"
            aria-label="Add variable"
            className="rounded-lg border px-3 py-2 text-[13px] transition-colors"
            style={{ borderColor: theme.chipBorder, backgroundColor: theme.chip, color: theme.sec }}
          >
            +
          </button>
        </form>
      </section>

      <section className="mt-2 border-t p-[18px_24px_28px]" style={{ borderColor: theme.subtle }}>
        <button
          onClick={handleDeleteService}
          className="inline-flex items-center gap-[6px] rounded-lg border px-4 py-2 text-[12.5px] font-medium transition-colors"
          style={{ borderColor: theme.dangerBorder, color: theme.danger }}
        >
          <Trash2Icon size={13} />
          {dict.deleteService}
        </button>
      </section>
    </aside>
  )
}
