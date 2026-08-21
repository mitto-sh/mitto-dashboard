import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { ImportFromGithubModal } from '@/app/projects/[id]/components/ImportFromGithubModal'
import { renderWithTheme } from '../../../../helpers/renderWithTheme'
import type { GithubInstallation, GithubRepo, Service } from '@/lib/types'

vi.mock('@/lib/api', () => ({
  api: {
    listGithubInstallations: vi.fn(),
    githubInstallUrl: vi.fn(),
    listInstallationRepos: vi.fn(),
    getRepoConfig: vi.fn(),
    createService: vi.fn(),
  },
}))

import { api } from '@/lib/api'

const installation: GithubInstallation = {
  id: 'i1', installationId: '999', accountLogin: 'acme', accountType: 'Organization',
}

const repo: GithubRepo = {
  id: 1, name: 'api', full_name: 'acme/api', private: false, default_branch: 'main', html_url: 'https://github.com/acme/api',
}

const createdService: Service = {
  id: 's1', projectId: 'p1', name: 'web', type: 'web', port: 3000, cpu: 256, memory: 512, enabled: true,
  repoUrl: repo.html_url, repoProvider: 'github', defaultBranch: 'main',
  buildCommand: null, startCommand: null, outputDir: null, runtime: null,
}

let originalLocation: Location

beforeEach(() => {
  originalLocation = window.location
  // @ts-expect-error redefining for the test
  delete window.location
  // @ts-expect-error partial Location is fine for this test
  window.location = { href: '' }
})

describe('ImportFromGithubModal', () => {
  it('shows a Connect GitHub button when there are no installations', async () => {
    vi.mocked(api.listGithubInstallations).mockResolvedValue([])
    vi.mocked(api.githubInstallUrl).mockResolvedValue({ url: 'https://github.com/apps/mitto-sh/installations/new?state=x' })

    renderWithTheme(<ImportFromGithubModal projectId="p1" onCancel={vi.fn()} onImported={vi.fn()} />)

    const button = await screen.findByText('Connect GitHub')
    fireEvent.click(button)

    await waitFor(() => expect(window.location.href).toContain('github.com/apps'))
  })

  it('walks installation -> repo -> confirm, creating the detected service in the current project', async () => {
    vi.mocked(api.listGithubInstallations).mockResolvedValue([installation])
    vi.mocked(api.listInstallationRepos).mockResolvedValue([repo])
    vi.mocked(api.getRepoConfig).mockResolvedValue({
      found: true, valid: true, config: { services: [{ name: 'web', type: 'web', port: 3000 }] },
    })
    vi.mocked(api.createService).mockResolvedValue(createdService)

    const onImported = vi.fn()
    renderWithTheme(<ImportFromGithubModal projectId="p1" onCancel={vi.fn()} onImported={onImported} />)

    fireEvent.click(await screen.findByText('acme'))
    fireEvent.click(await screen.findByText('api'))

    expect(await screen.findByText(/web — web :3000/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Import' }))

    await waitFor(() => {
      expect(api.createService).toHaveBeenCalledWith({
        projectId: 'p1', name: 'web', type: 'web', port: 3000,
        repoUrl: repo.html_url, repoProvider: 'github', defaultBranch: 'main',
        buildCommand: undefined, startCommand: undefined, dockerfilePath: undefined,
      })
      expect(onImported).toHaveBeenCalledWith([createdService])
    })
  })

  it('falls back to a default web service when there is no mitto.yaml', async () => {
    vi.mocked(api.listGithubInstallations).mockResolvedValue([installation])
    vi.mocked(api.listInstallationRepos).mockResolvedValue([repo])
    vi.mocked(api.getRepoConfig).mockResolvedValue({ found: false })
    vi.mocked(api.createService).mockResolvedValue(createdService)

    renderWithTheme(<ImportFromGithubModal projectId="p1" onCancel={vi.fn()} onImported={vi.fn()} />)

    fireEvent.click(await screen.findByText('acme'))
    fireEvent.click(await screen.findByText('api'))

    expect(await screen.findByText(/api — web/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Import' }))

    await waitFor(() => {
      expect(api.createService).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 'p1', name: 'api', type: 'web' }),
      )
    })
  })

  it('filters the repo list', async () => {
    const otherRepo: GithubRepo = { ...repo, id: 2, name: 'dashboard', full_name: 'acme/dashboard' }
    vi.mocked(api.listGithubInstallations).mockResolvedValue([installation])
    vi.mocked(api.listInstallationRepos).mockResolvedValue([repo, otherRepo])

    renderWithTheme(<ImportFromGithubModal projectId="p1" onCancel={vi.fn()} onImported={vi.fn()} />)

    fireEvent.click(await screen.findByText('acme'))
    await screen.findByText('dashboard')

    fireEvent.change(screen.getByLabelText('Filter repositories'), { target: { value: 'dash' } })

    expect(screen.getByText('dashboard')).toBeInTheDocument()
    expect(screen.queryByText('api')).not.toBeInTheDocument()
  })

  it('shows an error message when loading installations fails', async () => {
    vi.mocked(api.listGithubInstallations).mockRejectedValue(new Error('network down'))
    renderWithTheme(<ImportFromGithubModal projectId="p1" onCancel={vi.fn()} onImported={vi.fn()} />)

    expect(await screen.findByText('network down')).toBeInTheDocument()
  })

  it('calls onCancel when the close button is clicked', async () => {
    vi.mocked(api.listGithubInstallations).mockResolvedValue([])
    const onCancel = vi.fn()
    renderWithTheme(<ImportFromGithubModal projectId="p1" onCancel={onCancel} onImported={vi.fn()} />)

    fireEvent.click(await screen.findByText('✕'))
    expect(onCancel).toHaveBeenCalled()
  })
})
