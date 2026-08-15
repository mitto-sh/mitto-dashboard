import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AddServiceModal } from '@/components/AddServiceModal'

describe('AddServiceModal', () => {
  it('shows a validation error and does not submit when the name is empty', async () => {
    const onCreate = vi.fn()
    render(<AddServiceModal onCancel={vi.fn()} onCreate={onCreate} />)

    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(onCreate).not.toHaveBeenCalled()
  })

  it('submits valid data', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined)
    render(<AddServiceModal onCancel={vi.fn()} onCreate={onCreate} />)

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'api' } })
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'worker' } })
    fireEvent.change(screen.getByLabelText('Port (optional)'), { target: { value: '4000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({ name: 'api', type: 'worker', port: 4000 })
    })
  })

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn()
    render(<AddServiceModal onCancel={onCancel} onCreate={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })
})
