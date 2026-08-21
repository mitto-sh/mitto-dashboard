import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../../../../helpers/renderWithTheme'
import { ServiceDetailPanel } from '@/app/projects/[id]/components/ServiceDetailPanel'
import type { Service, Deployment, EnvVar } from '@/lib/types'

const service: Service = {
  id: 'svc-1', projectId: 'p1', name: 'web', type: 'web', port: 3000, cpu: 256, memory: 512, enabled: true,
  repoUrl: null, repoProvider: null, defaultBranch: 'main',
  buildCommand: null, startCommand: null, outputDir: null, runtime: null,
}

const serviceWithRepo: Service = {
  ...service,
  repoUrl: 'https://github.com/acme/web',
  repoProvider: 'github',
  defaultBranch: 'develop',
}

const queuedDeployment: Deployment = {
  id: 'd1', serviceId: 'svc-1', environmentId: 'env-1', status: 'queued', commitSha: 'abc',
  commitMessage: 'init', deployUrl: null, errorMessage: null, createdAt: '',
}

const envVar: EnvVar = { id: 'e1', serviceId: 'svc-1', environmentId: 'env-1', key: 'NODE_ENV', value: '***', isSecret: true }

vi.mock('@/lib/api', () => ({
  api: {
    listDeployments: vi.fn(),
    listEnvVars: vi.fn(),
    triggerDeployment: vi.fn(),
    cancelDeployment: vi.fn(),
    upsertEnvVars: vi.fn(),
    deleteEnvVar: vi.fn(),
    updateService: vi.fn(),
  },
}))

import { api } from '@/lib/api'

function renderPanel(overrides: Partial<Parameters<typeof ServiceDetailPanel>[0]> = {}) {
  const onClose = vi.fn()
  const onServiceUpdated = vi.fn()
  const onDeploymentTriggered = vi.fn()
  renderWithTheme(
    <ServiceDetailPanel
      service={service}
      environmentId="env-1"
      onClose={onClose}
      onServiceUpdated={onServiceUpdated}
      onDeploymentTriggered={onDeploymentTriggered}
      {...overrides}
    />,
  )
  return { onClose, onServiceUpdated, onDeploymentTriggered }
}

async function openSettingsTab() {
  await userEvent.click(screen.getByRole('tab', { name: 'Settings' }))
}

describe('ServiceDetailPanel', () => {
  beforeEach(() => {
    vi.mocked(api.listDeployments).mockResolvedValue([])
    vi.mocked(api.listEnvVars).mockResolvedValue([envVar])
  })

  it('shows "no deployments yet" when there is no deployment history', async () => {
    renderPanel()
    expect(await screen.findByText('no deployments yet')).toBeInTheDocument()
  })

  it('shows the linked repo and branch when the service has one', async () => {
    renderPanel({ service: serviceWithRepo })
    const link = await screen.findByText(/github.com\/acme\/web @ develop/)
    expect(link).toHaveAttribute('href', 'https://github.com/acme/web')
  })

  it('omits the repo line when the service has no repo', async () => {
    renderPanel()
    await screen.findByText('no deployments yet')
    expect(screen.queryByText(/github.com/)).not.toBeInTheDocument()
  })

  it('shows the latest deployment status and a cancel button when cancellable', async () => {
    vi.mocked(api.listDeployments).mockResolvedValue([queuedDeployment])
    renderPanel()
    expect(await screen.findByText('queued')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('triggers a deployment and reports it to the parent', async () => {
    const newDeployment = { ...queuedDeployment, id: 'd2' }
    vi.mocked(api.triggerDeployment).mockResolvedValue(newDeployment)

    const { onDeploymentTriggered } = renderPanel()
    await screen.findByText('no deployments yet')
    fireEvent.click(screen.getByRole('button', { name: 'Deploy' }))

    await waitFor(() => expect(onDeploymentTriggered).toHaveBeenCalledWith(newDeployment))
  })

  it('shows an error message when triggering a deployment fails', async () => {
    vi.mocked(api.triggerDeployment).mockRejectedValue(new Error('boom'))
    renderPanel()
    await screen.findByText('no deployments yet')
    fireEvent.click(screen.getByRole('button', { name: 'Deploy' }))

    expect(await screen.findByText('boom')).toBeInTheDocument()
  })

  it('lists env vars and deletes one', async () => {
    renderPanel()
    await screen.findByText('no deployments yet')
    await openSettingsTab()
    expect(await screen.findByText('NODE_ENV')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Remove variable'))
    await waitFor(() => expect(api.deleteEnvVar).toHaveBeenCalledWith('svc-1', 'env-1', 'NODE_ENV'))
  })

  it('adds a new env var', async () => {
    vi.mocked(api.upsertEnvVars).mockResolvedValue([{ ...envVar, key: 'PORT', value: '***' }])
    renderPanel()
    await screen.findByText('no deployments yet')
    await openSettingsTab()
    await screen.findByText('NODE_ENV')

    fireEvent.change(screen.getByLabelText('Env var key'), { target: { value: 'port' } })
    fireEvent.change(screen.getByLabelText('Env var value'), { target: { value: '3000' } })
    fireEvent.submit(screen.getByLabelText('Env var key').closest('form')!)

    await waitFor(() => {
      expect(api.upsertEnvVars).toHaveBeenCalledWith('svc-1', 'env-1', [{ key: 'PORT', value: '3000', isSecret: true }])
    })
  })

  it('calls onClose when the close button is clicked', async () => {
    const { onClose } = renderPanel()
    await screen.findByText('no deployments yet')
    fireEvent.click(screen.getByLabelText('Close panel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('opens a confirmation modal when toggling the footer switch off, without calling the API yet', async () => {
    renderPanel()
    await screen.findByText('no deployments yet')
    await userEvent.click(screen.getByRole('switch', { name: 'Disable service' }))

    expect(await screen.findByText(/This will stop the service and its current deployment\./)).toBeInTheDocument()
    expect(api.updateService).not.toHaveBeenCalled()
  })

  it('closes the confirmation modal without disabling when Keep running is clicked', async () => {
    renderPanel()
    await screen.findByText('no deployments yet')
    await userEvent.click(screen.getByRole('switch', { name: 'Disable service' }))
    await screen.findByText(/This will stop the service/)

    fireEvent.click(screen.getByRole('button', { name: 'Keep running' }))

    await waitFor(() => expect(screen.queryByText(/This will stop the service/)).not.toBeInTheDocument())
    expect(api.updateService).not.toHaveBeenCalled()
  })

  it('disables the service and reports the update once the modal is confirmed', async () => {
    const updated = { ...service, enabled: false }
    vi.mocked(api.updateService).mockResolvedValue(updated)

    const { onServiceUpdated } = renderPanel()
    await screen.findByText('no deployments yet')
    await userEvent.click(screen.getByRole('switch', { name: 'Disable service' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Disable service' }))

    await waitFor(() => {
      expect(api.updateService).toHaveBeenCalledWith('svc-1', { enabled: false })
      expect(onServiceUpdated).toHaveBeenCalledWith(updated)
    })
    expect(screen.queryByText(/This will stop the service/)).not.toBeInTheDocument()
  })

  it('enables a disabled service directly, without a confirmation modal', async () => {
    const updated = { ...service, enabled: true }
    vi.mocked(api.updateService).mockResolvedValue(updated)

    const { onServiceUpdated } = renderPanel({ service: { ...service, enabled: false } })
    await screen.findByText('no deployments yet')
    await userEvent.click(screen.getByRole('switch', { name: 'Enable service' }))

    await waitFor(() => {
      expect(api.updateService).toHaveBeenCalledWith('svc-1', { enabled: true })
      expect(onServiceUpdated).toHaveBeenCalledWith(updated)
    })
    expect(screen.queryByText(/This will stop the service/)).not.toBeInTheDocument()
  })

  it('blocks Deploy and shows a hint when the service is disabled', async () => {
    renderPanel({ service: { ...service, enabled: false } })
    await screen.findByText('no deployments yet')

    expect(screen.getByRole('button', { name: 'Deploy' })).toBeDisabled()
    expect(screen.getByText(/new deployments are blocked while disabled/)).toBeInTheDocument()
  })

  it('keeps the enable/disable switch visible on both tabs', async () => {
    renderPanel()
    await screen.findByText('no deployments yet')
    expect(screen.getByRole('switch', { name: 'Disable service' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Settings' }))
    expect(screen.getByRole('switch', { name: 'Disable service' })).toBeInTheDocument()
  })
})
