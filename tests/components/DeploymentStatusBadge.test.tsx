import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DeploymentStatusBadge } from '@/components/DeploymentStatusBadge'

describe('DeploymentStatusBadge', () => {
  it('renders the status text for every known status', () => {
    const statuses = ['queued', 'building', 'pushing', 'provisioning', 'live', 'failed', 'cancelled'] as const
    for (const status of statuses) {
      const { unmount } = render(<DeploymentStatusBadge status={status} />)
      expect(screen.getByText(status)).toBeInTheDocument()
      unmount()
    }
  })
})
