import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../helpers/renderWithTheme'
import { CommandPalette } from '@/components/CommandPalette'
import type { Project } from '@/lib/types'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

const projects: Project[] = [
  { id: 'p1', name: 'api-gateway', slug: 'api-gateway', region: 'us-east-1', isPrivate: true, enabled: true, createdAt: new Date().toISOString() },
  { id: 'p2', name: 'marketing-site', slug: 'marketing-site', region: 'us-east-1', isPrivate: false, enabled: true, createdAt: new Date().toISOString() },
]

describe('CommandPalette', () => {
  it('lists all projects when open', () => {
    renderWithTheme(<CommandPalette projects={projects} open onOpenChange={vi.fn()} />)
    expect(screen.getByText('api-gateway')).toBeInTheDocument()
    expect(screen.getByText('marketing-site')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    renderWithTheme(<CommandPalette projects={projects} open={false} onOpenChange={vi.fn()} />)
    expect(screen.queryByText('api-gateway')).not.toBeInTheDocument()
  })

  it('filters projects by typed text', async () => {
    renderWithTheme(<CommandPalette projects={projects} open onOpenChange={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('Jump to a project…'), 'marketing')

    expect(screen.getByText('marketing-site')).toBeInTheDocument()
    expect(screen.queryByText('api-gateway')).not.toBeInTheDocument()
  })

  it('navigates to the selected project and closes', async () => {
    const onOpenChange = vi.fn()
    renderWithTheme(<CommandPalette projects={projects} open onOpenChange={onOpenChange} />)
    await userEvent.click(screen.getByText('api-gateway'))

    expect(push).toHaveBeenCalledWith('/projects/p1')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
