import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ServiceDetailPanel } from '@/components/ServiceDetailPanel'
import type { Service, Deployment, EnvVar } from '@/lib/types'

const service: Service = {
  id: 'svc-1', projectId: 'p1', name: 'web', type: 'web', port: 3000, cpu: 256, memory: 512,
}

const queuedDeployment: Deployment = {
  id: 'd1', serviceId: 'svc-1', status: 'queued', commitSha: 'abc',
  commitMessage: 'init', deployUrl: null, errorMessage: null, createdAt: '',
}

const envVar: EnvVar = { id: 'e1', serviceId: 'svc-1', key: 'NODE_ENV', value: '***', isSecret: true }

vi.mock('@/lib/api', () => ({
  api: {
    listDeployments: vi.fn(),
    listEnvVars: vi.fn(),
    triggerDeployment: vi.fn(),
    cancelDeployment: vi.fn(),
    upsertEnvVars: vi.fn(),
    deleteEnvVar: vi.fn(),
    deleteService: vi.fn(),
  },
}))

import { api } from '@/lib/api'

describe('ServiceDetailPanel', () => {
  beforeEach(() => {
    vi.mocked(api.listDeployments).mockResolvedValue([])
    vi.mocked(api.listEnvVars).mockResolvedValue([envVar])
  })

  it('shows "No deployments yet" when there is no deployment history', async () => {
    render(
      <ServiceDetailPanel
        service={service}
        onClose={vi.fn()}
        onServiceDeleted={vi.fn()}
        onDeploymentTriggered={vi.fn()}
      />,
    )
    expect(await screen.findByText('No deployments yet')).toBeInTheDocument()
  })

  it('shows the latest deployment status and a cancel button when cancellable', async () => {
    vi.mocked(api.listDeployments).mockResolvedValue([queuedDeployment])
    render(
      <ServiceDetailPanel
        service={service}
        onClose={vi.fn()}
        onServiceDeleted={vi.fn()}
        onDeploymentTriggered={vi.fn()}
      />,
    )
    expect(await screen.findByText('queued')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('triggers a deployment and reports it to the parent', async () => {
    const onDeploymentTriggered = vi.fn()
    const newDeployment = { ...queuedDeployment, id: 'd2' }
    vi.mocked(api.triggerDeployment).mockResolvedValue(newDeployment)

    render(
      <ServiceDetailPanel
        service={service}
        onClose={vi.fn()}
        onServiceDeleted={vi.fn()}
        onDeploymentTriggered={onDeploymentTriggered}
      />,
    )
    await screen.findByText('No deployments yet')
    fireEvent.click(screen.getByRole('button', { name: 'Deploy' }))

    await waitFor(() => expect(onDeploymentTriggered).toHaveBeenCalledWith(newDeployment))
  })

  it('shows an error message when triggering a deployment fails', async () => {
    vi.mocked(api.triggerDeployment).mockRejectedValue(new Error('boom'))
    render(
      <ServiceDetailPanel
        service={service}
        onClose={vi.fn()}
        onServiceDeleted={vi.fn()}
        onDeploymentTriggered={vi.fn()}
      />,
    )
    await screen.findByText('No deployments yet')
    fireEvent.click(screen.getByRole('button', { name: 'Deploy' }))

    expect(await screen.findByText('boom')).toBeInTheDocument()
  })

  it('lists env vars and deletes one', async () => {
    render(
      <ServiceDetailPanel
        service={service}
        onClose={vi.fn()}
        onServiceDeleted={vi.fn()}
        onDeploymentTriggered={vi.fn()}
      />,
    )
    expect(await screen.findByText('NODE_ENV')).toBeInTheDocument()

    fireEvent.click(screen.getByText('remove'))
    await waitFor(() => expect(api.deleteEnvVar).toHaveBeenCalledWith('svc-1', 'NODE_ENV'))
  })

  it('adds a new env var', async () => {
    vi.mocked(api.upsertEnvVars).mockResolvedValue([{ ...envVar, key: 'PORT', value: '***' }])
    render(
      <ServiceDetailPanel
        service={service}
        onClose={vi.fn()}
        onServiceDeleted={vi.fn()}
        onDeploymentTriggered={vi.fn()}
      />,
    )
    await screen.findByText('NODE_ENV')

    fireEvent.change(screen.getByLabelText('Env var key'), { target: { value: 'port' } })
    fireEvent.change(screen.getByLabelText('Env var value'), { target: { value: '3000' } })
    fireEvent.submit(screen.getByLabelText('Env var key').closest('form')!)

    await waitFor(() => {
      expect(api.upsertEnvVars).toHaveBeenCalledWith('svc-1', [{ key: 'PORT', value: '3000', isSecret: true }])
    })
  })

  it('deletes the service and reports it to the parent', async () => {
    const onServiceDeleted = vi.fn()
    render(
      <ServiceDetailPanel
        service={service}
        onClose={vi.fn()}
        onServiceDeleted={onServiceDeleted}
        onDeploymentTriggered={vi.fn()}
      />,
    )
    await screen.findByText('No deployments yet')
    fireEvent.click(screen.getByText('Delete service'))

    await waitFor(() => expect(onServiceDeleted).toHaveBeenCalledWith('svc-1'))
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(
      <ServiceDetailPanel
        service={service}
        onClose={onClose}
        onServiceDeleted={vi.fn()}
        onDeploymentTriggered={vi.fn()}
      />,
    )
    await screen.findByText('No deployments yet')
    fireEvent.click(screen.getByLabelText('Close panel'))
    expect(onClose).toHaveBeenCalled()
  })
})
