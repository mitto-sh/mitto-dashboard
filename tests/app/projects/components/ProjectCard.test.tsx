import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectCard } from '@/app/projects/components/ProjectCard'
import { renderWithTheme } from '../../../helpers/renderWithTheme'
import type { Project, Service } from '@/lib/types'

const services: Service[] = [
  {
    id: 'svc-1', projectId: 'p1', name: 'web', type: 'web', port: 3000, cpu: 256, memory: 512, enabled: true,
    repoUrl: null, repoProvider: null, defaultBranch: 'main', buildCommand: null, startCommand: null, outputDir: null, runtime: null,
  },
]

const project: Project = {
  id: 'p1', name: 'Acme', slug: 'acme', region: 'us-east-1',
  isPrivate: true, enabled: true, createdAt: new Date().toISOString(), services,
}

function renderCard(overrides: Partial<Parameters<typeof ProjectCard>[0]> = {}) {
  const onRequestDelete = vi.fn()
  const onRequestSettings = vi.fn()
  renderWithTheme(
    <ProjectCard project={project} onRequestDelete={onRequestDelete} onRequestSettings={onRequestSettings} {...overrides} />,
  )
  return { onRequestDelete, onRequestSettings }
}

describe('ProjectCard', () => {
  it('links to the project canvas', () => {
    renderCard()
    expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', '/projects/p1')
  })

  it('shows the identity avatar with the first letter of the name', () => {
    renderCard()
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('shows region and service count in the footer', () => {
    renderCard()
    expect(screen.getByText('us-east-1')).toBeInTheDocument()
    expect(screen.getByText('1 service')).toBeInTheDocument()
  })

  it('omits the disabled badge when enabled', () => {
    renderCard()
    expect(screen.queryByText('disabled')).not.toBeInTheDocument()
  })

  it('shows the disabled badge when disabled', () => {
    renderCard({ project: { ...project, enabled: false } })
    expect(screen.getByText('disabled')).toBeInTheDocument()
  })

  it('opens a menu with Settings and Delete', async () => {
    renderCard()

    await userEvent.click(screen.getByLabelText('Project actions'))

    expect(await screen.findByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onRequestSettings with the project when Settings is clicked, without navigating away', async () => {
    const { onRequestSettings } = renderCard()

    await userEvent.click(screen.getByLabelText('Project actions'))
    await userEvent.click(await screen.findByText('Settings'))

    expect(onRequestSettings).toHaveBeenCalledWith(project)
  })

  it('calls onRequestDelete with the project when Delete is clicked', async () => {
    const { onRequestDelete } = renderCard()

    await userEvent.click(screen.getByLabelText('Project actions'))
    await userEvent.click(await screen.findByText('Delete'))

    expect(onRequestDelete).toHaveBeenCalledWith(project)
  })

  it('closes the menu on Escape', async () => {
    renderCard()

    await userEvent.click(screen.getByLabelText('Project actions'))
    expect(await screen.findByText('Delete')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByText('Delete')).not.toBeInTheDocument())
  })
})
