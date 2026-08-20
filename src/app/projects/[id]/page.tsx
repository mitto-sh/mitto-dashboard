'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/AuthGuard'
import { AppHeader } from '@/components/AppHeader'
import { Canvas } from '@/components/Canvas'
import { AddServiceModal } from '@/components/AddServiceModal'
import { AddServiceChooserModal } from '@/components/AddServiceChooserModal'
import { ImportFromGithubModal } from '@/components/ImportFromGithubModal'
import { ServiceDetailPanel } from '@/components/ServiceDetailPanel'
import { ProjectDetailPanel } from '@/components/ProjectDetailPanel'
import { PlusIcon, SettingsIcon } from '@/components/icons'
import { useThemeContext } from '@/components/ThemeProvider'
import { api } from '@/lib/api'
import type { Project, Service, Deployment } from '@/lib/types'

type AddServiceStep = 'closed' | 'choose' | 'manual' | 'github'

type PanelState =
  | { kind: 'none' }
  | { kind: 'service'; service: Service }
  | { kind: 'project'; tab: 'overview' | 'settings' }

function ProjectCanvasView({ projectId }: { projectId: string }) {
  const { theme, dict } = useThemeContext()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [latestDeployments, setLatestDeployments] = useState<Record<string, Deployment | undefined>>({})
  const [panel, setPanel] = useState<PanelState>({ kind: 'none' })
  const [addServiceStep, setAddServiceStep] = useState<AddServiceStep>('closed')

  useEffect(() => {
    api.getProject(projectId).then(async (p) => {
      setProject(p)
      const entries = await Promise.all(
        (p.services ?? []).map(async (s) => {
          const deployments = await api.listDeployments(s.id).catch(() => [])
          return [s.id, deployments[0]] as const
        }),
      )
      setLatestDeployments(Object.fromEntries(entries))
    }).catch(() => {})
  }, [projectId])

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

  if (!project) {
    return <p className="p-6 font-mono text-sm" style={{ color: theme.muted }}>Loading…</p>
  }

  return (
    <div>
      <AppHeader
        breadcrumb={
          <>
            <span className="font-mono text-caption" style={{ color: theme.faint }}>/</span>
            <button
              onClick={() => setPanel({ kind: 'project', tab: 'overview' })}
              className="text-caption font-medium transition-colors"
              style={{ color: theme.ink }}
            >
              {project.slug}
            </button>
            {!project.enabled && (
              <span
                className="rounded-[5px] border px-[7px] py-[2px] font-mono text-label font-medium uppercase tracking-[0.08em]"
                style={{ color: theme.danger, borderColor: theme.dangerBorder, backgroundColor: theme.dangerBg }}
              >
                disabled
              </span>
            )}
          </>
        }
        actions={
          <>
            <button
              onClick={() => setPanel({ kind: 'project', tab: 'settings' })}
              aria-label="Project settings"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
              style={{ borderColor: theme.border, color: theme.sec }}
            >
              <SettingsIcon size={14} />
            </button>
            <button
              onClick={() => setAddServiceStep('choose')}
              className="inline-flex items-center gap-[6px] rounded-lg px-[14px] py-[7px] text-body-sm font-semibold transition-colors"
              style={{ backgroundColor: theme.accent, color: theme.accentInk }}
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

      {panel.kind === 'service' && (
        <ServiceDetailPanel
          service={panel.service}
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
