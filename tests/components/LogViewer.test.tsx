import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '../helpers/renderWithTheme'
import { LogViewer } from '@/components/LogViewer'
import type { LogLine } from '@/lib/useDeploymentLogs'

const useDeploymentLogs = vi.fn()
vi.mock('@/lib/useDeploymentLogs', () => ({
  useDeploymentLogs: (...args: unknown[]) => useDeploymentLogs(...args),
}))

describe('LogViewer', () => {
  it('shows a waiting message when there are no lines yet', () => {
    useDeploymentLogs.mockReturnValue([] as LogLine[])
    renderWithTheme(<LogViewer deploymentId="d1" />)

    expect(screen.getByText('Waiting for logs…')).toBeInTheDocument()
  })

  it('renders each received line', () => {
    useDeploymentLogs.mockReturnValue([
      { type: 'build', line: 'Step 1/3 : FROM node:20-alpine' },
      { type: 'runtime', line: 'Server listening on 3000' },
    ] as LogLine[])
    renderWithTheme(<LogViewer deploymentId="d1" />)

    expect(screen.getByText('Step 1/3 : FROM node:20-alpine')).toBeInTheDocument()
    expect(screen.getByText('Server listening on 3000')).toBeInTheDocument()
  })
})
