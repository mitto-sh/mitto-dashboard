import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../helpers/renderWithTheme'
import { EntityPanel } from '@/components/EntityPanel'

function setup(onOpenChange = vi.fn(), onTabChange = vi.fn(), tab: 'overview' | 'settings' = 'overview') {
  renderWithTheme(
    <EntityPanel
      open
      onOpenChange={onOpenChange}
      title="api-gateway"
      tab={tab}
      onTabChange={onTabChange}
      overviewLabel="Overview"
      settingsLabel="Settings"
      overview={<p>overview content</p>}
      settings={<p>settings content</p>}
    />,
  )
  return { onOpenChange, onTabChange }
}

describe('EntityPanel', () => {
  it('renders the title and the active tab content', () => {
    setup()
    expect(screen.getByText('api-gateway')).toBeInTheDocument()
    expect(screen.getByText('overview content')).toBeInTheDocument()
    expect(screen.queryByText('settings content')).not.toBeInTheDocument()
  })

  it('shows the settings content when tab is settings', () => {
    setup(vi.fn(), vi.fn(), 'settings')
    expect(screen.getByText('settings content')).toBeInTheDocument()
    expect(screen.queryByText('overview content')).not.toBeInTheDocument()
  })

  it('calls onTabChange when the Settings tab is clicked', async () => {
    const { onTabChange } = setup()
    await userEvent.click(screen.getByRole('tab', { name: 'Settings' }))
    expect(onTabChange).toHaveBeenCalledWith('settings')
  })

  it('closes via the close button', () => {
    const { onOpenChange } = setup()
    fireEvent.click(screen.getByLabelText('Close panel'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes on Escape', async () => {
    const { onOpenChange } = setup()
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
