import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { ProjectCard } from '@/components/ProjectCard'
import { renderWithTheme } from '../helpers/renderWithTheme'
import type { Project, Service } from '@/lib/types'

const services: Service[] = [
  {
    id: 'svc-1', projectId: 'p1', name: 'web', type: 'web', port: 3000, cpu: 256, memory: 512,
    repoUrl: null, repoProvider: null, defaultBranch: 'main', buildCommand: null, startCommand: null, outputDir: null, runtime: null,
  },
]

const project: Project = {
  id: 'p1', name: 'Acme', slug: 'acme', region: 'us-east-1',
  isPrivate: true, enabled: true, createdAt: new Date().toISOString(), services,
}

describe('ProjectCard', () => {
  it('links to the project canvas', () => {
    renderWithTheme(<ProjectCard project={project} onRequestDelete={vi.fn()} />)
    expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', '/projects/p1')
  })

  it('shows the identity avatar with the first letter of the name', () => {
    renderWithTheme(<ProjectCard project={project} onRequestDelete={vi.fn()} />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('shows region and service count in the footer', () => {
    renderWithTheme(<ProjectCard project={project} onRequestDelete={vi.fn()} />)
    expect(screen.getByText('us-east-1')).toBeInTheDocument()
    expect(screen.getByText('1 service')).toBeInTheDocument()
  })

  it('omits the disabled badge when enabled', () => {
    renderWithTheme(<ProjectCard project={project} onRequestDelete={vi.fn()} />)
    expect(screen.queryByText('disabled')).not.toBeInTheDocument()
  })

  it('shows the disabled badge when disabled', () => {
    renderWithTheme(<ProjectCard project={{ ...project, enabled: false }} onRequestDelete={vi.fn()} />)
    expect(screen.getByText('disabled')).toBeInTheDocument()
  })

  it('opens a menu with Settings and Delete', () => {
    renderWithTheme(<ProjectCard project={project} onRequestDelete={vi.fn()} />)

    fireEvent.click(screen.getByLabelText('Project actions'))

    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/projects/p1/settings')
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onRequestDelete with the project when Delete is clicked', () => {
    const onRequestDelete = vi.fn()
    renderWithTheme(<ProjectCard project={project} onRequestDelete={onRequestDelete} />)

    fireEvent.click(screen.getByLabelText('Project actions'))
    fireEvent.click(screen.getByText('Delete'))

    expect(onRequestDelete).toHaveBeenCalledWith(project)
  })

  it('closes the menu when clicking the backdrop', () => {
    renderWithTheme(<ProjectCard project={project} onRequestDelete={vi.fn()} />)

    fireEvent.click(screen.getByLabelText('Project actions'))
    expect(screen.getByText('Delete')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Close menu'))
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })
})
