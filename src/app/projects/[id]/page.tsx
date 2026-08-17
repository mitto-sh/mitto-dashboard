'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/AuthGuard'
import { Canvas } from '@/components/Canvas'
import { AddServiceModal } from '@/components/AddServiceModal'
import { ServiceDetailPanel } from '@/components/ServiceDetailPanel'
import { ProjectSettingsModal } from '@/components/ProjectSettingsModal'
import { Logo } from '@/components/Logo'
import { PlusIcon, SettingsIcon } from '@/components/icons'
import { useThemeContext } from '@/components/ThemeProvider'
import { api } from '@/lib/api'
import type { Project, Service, Deployment } from '@/lib/types'

function ProjectCanvasView({ projectId }: { projectId: string }) {
  const router = useRouter()
  const { theme, dict } = useThemeContext()
  const [project, setProject] = useState<Project | null>(null)
  const [latestDeployments, setLatestDeployments] = useState<Record<string, Deployment | undefined>>({})
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

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
    setShowAddModal(false)
  }

  function handleServiceDeleted(serviceId: string) {
    setProject((prev) =>
      prev ? { ...prev, services: (prev.services ?? []).filter((s) => s.id !== serviceId) } : prev,
    )
    setSelectedService(null)
  }

  function handleDeploymentTriggered(deployment: Deployment) {
    setLatestDeployments((prev) => ({ ...prev, [deployment.serviceId]: deployment }))
  }

  if (!project) {
    return <p className="p-6 font-mono text-sm" style={{ color: theme.muted }}>Loading…</p>
  }

  return (
    <div>
      <header
        className="relative z-20 flex h-14 items-center justify-between border-b px-5"
        style={{ borderColor: theme.subtle, backgroundColor: theme.headerBg }}
      >
        <div className="flex items-center gap-[10px]">
          <Link href="/projects" className="flex items-center gap-[10px] transition-colors" style={{ color: theme.muted }}>
            <Logo size={11} />
            <span className="font-mono text-[13px] font-medium" style={{ color: theme.ink }}>mitto</span>
          </Link>
          <span className="font-mono text-[13px]" style={{ color: theme.faint }}>/</span>
          <h1 className="text-[13px] font-medium" style={{ color: theme.ink }}>{project.slug}</h1>
          {!project.enabled && (
            <span
              className="rounded-[5px] border px-[7px] py-[2px] font-mono text-[10px] font-medium uppercase tracking-[0.08em]"
              style={{ color: theme.danger, borderColor: theme.dangerBorder, backgroundColor: theme.dangerBg }}
            >
              disabled
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            aria-label="Project settings"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
            style={{ borderColor: theme.border, color: theme.sec }}
          >
            <SettingsIcon size={14} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-[6px] rounded-lg px-[14px] py-[7px] text-[12.5px] font-semibold transition-colors"
            style={{ backgroundColor: theme.accent, color: theme.accentInk }}
          >
            <PlusIcon size={13} />
            {dict.addService}
          </button>
        </div>
      </header>

      <Canvas
        projectId={projectId}
        services={project.services ?? []}
        latestDeployments={latestDeployments}
        selectedServiceId={selectedService?.id ?? null}
        onSelectService={setSelectedService}
        onAddService={() => setShowAddModal(true)}
      />

      {showAddModal && (
        <AddServiceModal
          projectSlug={project.slug}
          onCancel={() => setShowAddModal(false)}
          onCreate={handleCreateService}
        />
      )}

      {selectedService && (
        <ServiceDetailPanel
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onServiceDeleted={handleServiceDeleted}
          onDeploymentTriggered={handleDeploymentTriggered}
        />
      )}

      {showSettingsModal && (
        <ProjectSettingsModal
          project={project}
          onCancel={() => setShowSettingsModal(false)}
          onUpdated={(updated) => {
            setProject(updated)
            setShowSettingsModal(false)
          }}
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
