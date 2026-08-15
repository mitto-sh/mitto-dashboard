'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Service, Deployment, EnvVar } from '@/lib/types'
import { DeploymentStatusBadge } from './DeploymentStatusBadge'

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
    <aside className="fixed right-0 top-0 h-full w-96 overflow-y-auto border-l border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{service.name}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300" aria-label="Close panel">
          ✕
        </button>
      </div>

      <section className="mb-6">
        <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">Deployments</h3>
        {latest ? (
          <div className="mb-2 flex items-center gap-2">
            <DeploymentStatusBadge status={latest.status} />
            <span className="text-xs text-gray-500">{latest.commitMessage ?? 'no commit message'}</span>
          </div>
        ) : (
          <p className="mb-2 text-xs text-gray-500">No deployments yet</p>
        )}
        {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleDeploy}
            disabled={busy}
            className="rounded bg-white px-3 py-1.5 text-xs font-medium text-gray-900 disabled:opacity-50"
          >
            Deploy
          </button>
          {latest && CANCELLABLE.has(latest.status) && (
            <button
              onClick={handleCancel}
              disabled={busy}
              className="rounded border border-border px-3 py-1.5 text-xs text-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </section>

      <section className="mb-6">
        <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">Environment variables</h3>
        <ul className="mb-3 space-y-1">
          {envVars.map((v) => (
            <li key={v.key} className="flex items-center justify-between text-xs">
              <span className="font-mono text-gray-300">{v.key}</span>
              <button onClick={() => handleDeleteEnvVar(v.key)} className="text-gray-600 hover:text-red-400">
                remove
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddEnvVar} className="flex gap-1">
          <input
            aria-label="Env var key"
            placeholder="KEY"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value.toUpperCase())}
            className="w-1/2 rounded border border-border bg-canvas px-2 py-1 text-xs"
          />
          <input
            aria-label="Env var value"
            placeholder="value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-1/2 rounded border border-border bg-canvas px-2 py-1 text-xs"
          />
          <button type="submit" className="rounded bg-gray-700 px-2 py-1 text-xs">+</button>
        </form>
      </section>

      <button onClick={handleDeleteService} className="text-xs text-red-400 hover:text-red-300">
        Delete service
      </button>
    </aside>
  )
}
