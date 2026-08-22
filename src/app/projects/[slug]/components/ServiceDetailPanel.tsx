'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Service, Deployment, EnvVar } from '@/lib/types'
import { statusLabel } from '@/lib/status'
import { statusColorFor } from '@/lib/theme'
import { formatRelativeTime } from '@/lib/time'
import { useThemeContext } from '@/components/ThemeProvider'
import { EntityPanel, type EntityPanelTab } from '@/components/EntityPanel'
import { DisableServiceDialog } from './DisableServiceDialog'
import { Switch } from '@/components/ui/switch'
import { ServiceTypeIcon, XIcon, RocketIcon } from '@/components/icons'

interface ServiceDetailPanelProps {
  service: Service
  environmentId: string
  onClose: () => void
  onServiceUpdated: (service: Service) => void
  onDeploymentTriggered: (deployment: Deployment) => void
}

const CANCELLABLE = new Set(['queued', 'building', 'pushing', 'provisioning'])

export function ServiceDetailPanel({
  service,
  environmentId,
  onClose,
  onServiceUpdated,
  onDeploymentTriggered,
}: ServiceDetailPanelProps) {
  const { theme, dict } = useThemeContext()
  const [tab, setTab] = useState<EntityPanelTab>('overview')
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [envVars, setEnvVars] = useState<EnvVar[]>([])
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [togglingEnabled, setTogglingEnabled] = useState(false)
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)

  useEffect(() => {
    api.listDeployments(service.id, environmentId).then(setDeployments).catch(() => setDeployments([]))
    api.listEnvVars(service.id, environmentId).then(setEnvVars).catch(() => setEnvVars([]))
  }, [service.id, environmentId])

  const latest = deployments[0]
  // Genuine per-instance computation (varies with deployment status at runtime) —
  // not a static token lookup, so this one stays on the theme object.
  const color = statusColorFor(theme, latest?.status)

  async function handleDeploy() {
    setBusy(true)
    setError(null)
    try {
      const deployment = await api.triggerDeployment(service.id, environmentId)
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
    const updated = await api.upsertEnvVars(service.id, environmentId, [
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
    await api.deleteEnvVar(service.id, environmentId, key)
    setEnvVars((prev) => prev.filter((v) => v.key !== key))
  }

  async function setEnabled(enabled: boolean) {
    setTogglingEnabled(true)
    try {
      const updated = await api.updateService(service.id, { enabled })
      onServiceUpdated(updated)
    } finally {
      setTogglingEnabled(false)
    }
  }

  function handleSwitchChange(checked: boolean) {
    if (checked) {
      void setEnabled(true)
    } else {
      setShowDisableConfirm(true)
    }
  }

  async function handleConfirmDisable() {
    await setEnabled(false)
    setShowDisableConfirm(false)
  }

  return (
    <>
      <EntityPanel
        open
        onOpenChange={(next) => { if (!next) onClose() }}
        title={service.name}
        statusColor={color}
        tab={tab}
        onTabChange={setTab}
        overviewLabel={dict.overview}
        settingsLabel={dict.settings}
        meta={
          <>
            <div className="mt-[14px] flex items-center gap-[8px]">
              <span className="inline-flex items-center gap-[6px] rounded-md border border-border-chip bg-chip px-[9px] py-[5px] font-mono text-caption font-medium uppercase tracking-[0.06em] text-ink-secondary">
                <ServiceTypeIcon type={service.type} size={13} />
                {service.type}
              </span>
              <span className="font-mono text-caption text-ink-secondary">
                {service.port ? `:${service.port}` : 'no port'}
              </span>
            </div>
            {service.repoUrl && (
              <a
                href={service.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-[10px] block truncate font-mono text-body-sm text-ink-secondary hover:underline"
              >
                {service.repoUrl.replace(/^https?:\/\/(www\.)?/, '')} @ {service.defaultBranch}
              </a>
            )}
          </>
        }
        overview={
          <section className="p-[20px_28px]">
            {latest ? (
              <div className="mb-[14px] rounded-[10px] border border-line bg-raised p-[14px_16px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-body-sm font-medium" style={{ color }}>
                    {statusLabel(latest.status)}
                  </span>
                  <span className="font-mono text-caption text-ink-secondary">
                    {formatRelativeTime(latest.createdAt)}
                  </span>
                </div>
                <p className="mt-[10px] text-body-sm leading-[1.5] text-ink">
                  {latest.commitMessage ?? 'no commit message'}
                </p>
                {latest.commitSha && (
                  <p className="mt-[6px] font-mono text-caption text-ink-secondary">{latest.commitSha}</p>
                )}
              </div>
            ) : (
              <div className="mb-[14px] rounded-[10px] border border-dashed border-border p-[18px_16px] text-center">
                <p className="font-mono text-body-sm text-ink-secondary">{dict.noDeploys}</p>
              </div>
            )}
            {error && <p className="mb-2 text-body-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleDeploy}
                disabled={busy || !service.enabled}
                className="inline-flex items-center gap-[6px] rounded-lg bg-primary px-4 py-[9px] text-caption font-semibold text-primary-foreground transition-colors disabled:opacity-50"
              >
                <RocketIcon size={13} />
                {dict.deploy}
              </button>
              {latest && CANCELLABLE.has(latest.status) && (
                <button
                  onClick={handleCancel}
                  disabled={busy}
                  className="rounded-lg border border-border px-4 py-[9px] text-caption font-medium text-ink-secondary transition-colors disabled:opacity-50"
                >
                  {dict.cancel}
                </button>
              )}
            </div>
          </section>
        }
        settings={
          <>
            <section className="p-[20px_28px]">
              <h3 className="mb-3 font-mono text-label font-medium uppercase tracking-[0.08em] text-ink-secondary">
                {dict.envVars}
              </h3>
              <ul className="mb-[14px] overflow-hidden rounded-[10px] border border-line">
                {envVars.map((v) => (
                  <li
                    key={v.key}
                    className="flex items-center gap-[10px] border-b border-border-subtle bg-surface p-[11px_14px] last:border-b-0"
                  >
                    <span className="flex-1 truncate font-mono text-body-sm font-medium text-ink-2">{v.key}</span>
                    <span className="font-mono text-caption text-ink-faint">•••••••</span>
                    <button
                      onClick={() => handleDeleteEnvVar(v.key)}
                      aria-label="Remove variable"
                      className="inline-flex p-[2px] text-ink-muted transition-colors"
                    >
                      <XIcon size={13} />
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
                  className="w-2/5 rounded-lg border border-border bg-canvas px-[10px] py-[9px] font-mono text-caption text-ink outline-none transition-colors"
                />
                <input
                  aria-label="Env var value"
                  placeholder="value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-canvas px-[10px] py-[9px] font-mono text-caption text-ink outline-none transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Add variable"
                  className="rounded-lg border border-border-chip bg-chip px-3 py-[9px] text-body-sm text-ink-secondary transition-colors"
                >
                  +
                </button>
              </form>
            </section>
          </>
        }
        footer={
          <div className="border-t border-border-subtle bg-panel p-[16px_28px]">
            <div className={`flex items-center justify-between ${service.enabled ? 'text-ink' : 'text-ink-secondary'}`}>
              <span className="text-body-sm font-medium">
                {service.enabled ? dict.enabledLabel : dict.disabledLabel}
              </span>
              <Switch
                checked={service.enabled}
                onCheckedChange={handleSwitchChange}
                disabled={togglingEnabled}
                aria-label={service.enabled ? dict.disableService : dict.enableService}
              />
            </div>
            {!service.enabled && (
              <p className="mt-[8px] text-caption leading-[1.5] text-ink-secondary">
                {dict.blockedNote}
              </p>
            )}
          </div>
        }
      />

      {showDisableConfirm && (
        <DisableServiceDialog
          serviceName={service.name}
          onCancel={() => setShowDisableConfirm(false)}
          onConfirm={handleConfirmDisable}
        />
      )}
    </>
  )
}
