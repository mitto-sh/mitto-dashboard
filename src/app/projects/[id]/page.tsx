'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/AuthGuard'
import { Canvas } from '@/components/Canvas'
import { AddServiceModal } from '@/components/AddServiceModal'
import { ServiceDetailPanel } from '@/components/ServiceDetailPanel'
import { api } from '@/lib/api'
import type { Project, Service, Deployment } from '@/lib/types'

function ProjectCanvasView({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [latestDeployments, setLatestDeployments] = useState<Record<string, Deployment | undefined>>({})
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

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
    })
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
    return <p className="p-6 text-sm text-gray-500">Loading…</p>
  }

  return (
    <div>
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-3">
          <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-300">← Projects</Link>
          <h1 className="text-sm font-semibold">{project.name}</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded bg-white px-3 py-1.5 text-xs font-medium text-gray-900"
        >
          + Add service
        </button>
      </header>

      <Canvas
        projectId={projectId}
        services={project.services ?? []}
        latestDeployments={latestDeployments}
        onSelectService={setSelectedService}
      />

      {showAddModal && (
        <AddServiceModal onCancel={() => setShowAddModal(false)} onCreate={handleCreateService} />
      )}

      {selectedService && (
        <ServiceDetailPanel
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onServiceDeleted={handleServiceDeleted}
          onDeploymentTriggered={handleDeploymentTriggered}
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
