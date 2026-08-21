import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithTheme } from '../../../../helpers/renderWithTheme'
import { AddServiceModal } from '@/app/projects/[id]/components/AddServiceModal'

describe('AddServiceModal', () => {
  it('shows a validation error and does not submit when the name is empty', async () => {
    const onCreate = vi.fn()
    renderWithTheme(<AddServiceModal projectSlug="my-app" onCancel={vi.fn()} onCreate={onCreate} />)

    fireEvent.click(screen.getByRole('button', { name: 'Create service' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(onCreate).not.toHaveBeenCalled()
  })

  it('submits valid data', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined)
    renderWithTheme(<AddServiceModal projectSlug="my-app" onCancel={vi.fn()} onCreate={onCreate} />)

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'api' } })
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'worker' } })
    fireEvent.change(screen.getByLabelText(/Port/), { target: { value: '4000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create service' }))

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({ name: 'api', type: 'worker', port: 4000 })
    })
  })

  it('shows the project slug as context', () => {
    renderWithTheme(<AddServiceModal projectSlug="my-app" onCancel={vi.fn()} onCreate={vi.fn()} />)
    expect(screen.getByText('my-app')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn()
    renderWithTheme(<AddServiceModal projectSlug="my-app" onCancel={onCancel} onCreate={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })
})
