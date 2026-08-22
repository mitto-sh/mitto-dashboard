import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { AddServiceChooserModal } from '@/app/projects/[slug]/components/AddServiceChooserModal'
import { renderWithTheme } from '../../../../helpers/renderWithTheme'

describe('AddServiceChooserModal', () => {
  it('calls onManual when manual configuration is picked', () => {
    const onManual = vi.fn()
    renderWithTheme(<AddServiceChooserModal onCancel={vi.fn()} onManual={onManual} onGithub={vi.fn()} />)

    fireEvent.click(screen.getByText('Manual configuration'))
    expect(onManual).toHaveBeenCalled()
  })

  it('calls onGithub when import from GitHub is picked', () => {
    const onGithub = vi.fn()
    renderWithTheme(<AddServiceChooserModal onCancel={vi.fn()} onManual={vi.fn()} onGithub={onGithub} />)

    fireEvent.click(screen.getByText('Import from GitHub'))
    expect(onGithub).toHaveBeenCalled()
  })

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn()
    renderWithTheme(<AddServiceChooserModal onCancel={onCancel} onManual={vi.fn()} onGithub={vi.fn()} />)

    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })
})
