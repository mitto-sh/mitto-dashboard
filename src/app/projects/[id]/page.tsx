'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/AuthGuard'
import { AppHeader } from '@/components/AppHeader'
import { Canvas } from './components/Canvas'
import { AddServiceModal } from './components/AddServiceModal'
import { AddServiceChooserModal } from './components/AddServiceChooserModal'
import { ImportFromGithubModal } from './components/ImportFromGithubModal'
import { ServiceDetailPanel } from './components/ServiceDetailPanel'
import { ProjectDetailPanel } from '@/components/ProjectDetailPanel'
import { EnvironmentSwitcher } from './components/EnvironmentSwitcher'
import { CreateEnvironmentModal } from '@/components/CreateEnvironmentModal'
import { PlusIcon, SettingsIcon } from '@/components/icons'
import { useThemeContext } from '@/components/ThemeProvider'
import { api } from '@/lib/api'
import { getSelectedEnvironmentId, setSelectedEnvironmentId } from '@/lib/selectedEnvironment'
import type { Project, Service, Deployment, Environment } from '@/lib/types'

type AddServiceStep = 'closed' | 'choose' | 'manual' | 'github'

type PanelState =
  | { kind: 'none' }
  | { kind: 'service'; service: Service }
  | { kind: 'project'; tab: 'overview' | 'settings' }

function ProjectCanvasView({ projectId }: { projectId: string }) {
  const { dict } = useThemeContext()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [latestDeployments, setLatestDeployments] = useState<Record<string, Deployment | undefined>>({})
  const [panel, setPanel] = useState<PanelState>({ kind: 'none' })
  const [addServiceStep, setAddServiceStep] = useState<AddServiceStep>('closed')
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null)
  const [createEnvOpen, setCreateEnvOpen] = useState(false)

  useEffect(() => {
    api.getProject(projectId).then(async (p) => {
      setProject(p)
      const envs = await api.listEnvironments(projectId).catch(() => [])
      setEnvironments(envs)

      const storedId = getSelectedEnvironmentId(projectId)
      const initial = envs.find((e) => e.id === storedId) ?? envs.find((e) => e.isDefault) ?? envs[0] ?? null
      setSelectedEnv(initial)
    }).catch(() => {})
  }, [projectId])

  useEffect(() => {
    if (!project || !selectedEnv) return

    Promise.all(
      (project.services ?? []).map(async (s) => {
        const deployments = await api.listDeployments(s.id, selectedEnv.id).catch(() => [])
        return [s.id, deployments[0]] as const
      }),
    ).then((entries) => setLatestDeployments(Object.fromEntries(entries)))
  }, [project, selectedEnv])

  function handleSelectEnv(env: Environment) {
    setSelectedEnv(env)
    setSelectedEnvironmentId(projectId, env.id)
  }

  async function handleCreateEnv(data: { name: string }) {
    const env = await api.createEnvironment({ projectId, name: data.name })
    setEnvironments((prev) => [...prev, env])
    handleSelectEnv(env)
    setCreateEnvOpen(false)
  }

  function handleEnvironmentCreated(env: Environment) {
    setEnvironments((prev) => [...prev, env])
  }

  function handleEnvironmentUpdated(env: Environment) {
    setEnvironments((prev) => prev.map((e) => (e.id === env.id ? env : e)))
    setSelectedEnv((prev) => (prev && prev.id === env.id ? env : prev))
  }

  function handleEnvironmentDeleted(id: string) {
    const next = environments.filter((e) => e.id !== id)
    setEnvironments(next)
    if (selectedEnv?.id === id) {
      const fallback = next.find((e) => e.isDefault) ?? next[0] ?? null
      setSelectedEnv(fallback)
      if (fallback) setSelectedEnvironmentId(projectId, fallback.id)
    }
  }

  async function handleCreateService(data: { name: string; type: string; port?: number }) {
    const service = await api.createService({
      projectId,
      name: data.name,
      type: data.type as Service['type'],
      port: data.port,
    })
    setProject((prev) => (prev ? { ...prev, services: [...(prev.services ?? []), service] } : prev))
    setAddServiceStep('closed')
  }

  function handleGithubImported(services: Service[]) {
    setProject((prev) => (prev ? { ...prev, services: [...(prev.services ?? []), ...services] } : prev))
    setAddServiceStep('closed')
  }

  function handleServiceUpdated(updated: Service) {
    setProject((prev) =>
      prev ? { ...prev, services: (prev.services ?? []).map((s) => (s.id === updated.id ? updated : s)) } : prev,
    )
    setPanel((prev) => (prev.kind === 'service' ? { kind: 'service', service: updated } : prev))
  }

  function handleDeploymentTriggered(deployment: Deployment) {
    setLatestDeployments((prev) => ({ ...prev, [deployment.serviceId]: deployment }))
  }

  if (!project || !selectedEnv) {
    return <p className="p-6 font-mono text-sm text-ink-muted">Loading…</p>
  }

  return (
    <div>
      <AppHeader
        breadcrumb={
          <>
            <span className="font-mono text-body-sm text-ink-faint">/</span>
            <button
              onClick={() => setPanel({ kind: 'project', tab: 'overview' })}
              className="text-body-sm font-medium text-ink transition-colors"
            >
              {project.slug}
            </button>
            {!project.enabled && (
              <span className="rounded-[5px] border border-danger-border bg-danger-bg px-[7px] py-[2px] font-mono text-label font-medium uppercase tracking-[0.08em] text-danger">
                disabled
              </span>
            )}
            <EnvironmentSwitcher
              environments={environments}
              selected={selectedEnv}
              onSelect={handleSelectEnv}
              onCreateNew={() => setCreateEnvOpen(true)}
              onManage={() => setPanel({ kind: 'project', tab: 'settings' })}
            />
          </>
        }
        actions={
          <>
            <button
              onClick={() => setPanel({ kind: 'project', tab: 'settings' })}
              aria-label="Project settings"
              className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-border bg-surface text-ink-secondary transition-colors"
            >
              <SettingsIcon size={14} />
            </button>
            <button
              onClick={() => setAddServiceStep('choose')}
              className="inline-flex h-8 items-center gap-[6px] rounded-lg bg-primary px-[14px] text-body-sm font-semibold text-primary-foreground transition-colors"
            >
              <PlusIcon size={13} />
              {dict.addService}
            </button>
          </>
        }
      />

      <Canvas
        projectId={projectId}
        services={project.services ?? []}
        latestDeployments={latestDeployments}
        selectedServiceId={panel.kind === 'service' ? panel.service.id : null}
        onSelectService={(service) => setPanel({ kind: 'service', service })}
        onAddService={() => setAddServiceStep('choose')}
      />

      {addServiceStep === 'choose' && (
        <AddServiceChooserModal
          onCancel={() => setAddServiceStep('closed')}
          onManual={() => setAddServiceStep('manual')}
          onGithub={() => setAddServiceStep('github')}
        />
      )}

      {addServiceStep === 'manual' && (
        <AddServiceModal
          projectSlug={project.slug}
          onCancel={() => setAddServiceStep('closed')}
          onCreate={handleCreateService}
        />
      )}

      {addServiceStep === 'github' && (
        <ImportFromGithubModal
          projectId={projectId}
          onCancel={() => setAddServiceStep('closed')}
          onImported={handleGithubImported}
        />
      )}

      {createEnvOpen && (
        <CreateEnvironmentModal
          onCancel={() => setCreateEnvOpen(false)}
          onCreate={handleCreateEnv}
        />
      )}

      {panel.kind === 'service' && (
        <ServiceDetailPanel
          service={panel.service}
          environmentId={selectedEnv.id}
          onClose={() => setPanel({ kind: 'none' })}
          onServiceUpdated={handleServiceUpdated}
          onDeploymentTriggered={handleDeploymentTriggered}
        />
      )}

      {panel.kind === 'project' && (
        <ProjectDetailPanel
          project={project}
          open
          tab={panel.tab}
          onTabChange={(tab) => setPanel({ kind: 'project', tab })}
          onClose={() => setPanel({ kind: 'none' })}
          onProjectUpdated={setProject}
          onDeleted={() => router.push('/projects')}
          environments={environments}
          onEnvironmentCreated={handleEnvironmentCreated}
          onEnvironmentUpdated={handleEnvironmentUpdated}
          onEnvironmentDeleted={handleEnvironmentDeleted}
        />
      )}
    </div>
  )
}

export default function ProjectPage() {
  const params = useParams<{ id: string }>()

  return (
    <AuthGuard>
      <ProjectCanvasView projectId={params.id} />
    </AuthGuard>
  )
}
