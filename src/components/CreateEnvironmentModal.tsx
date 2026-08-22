'use client'

import { useState } from 'react'
import { validateEnvironmentForm } from '@/lib/validation'
import { useThemeContext } from './ThemeProvider'
import { Modal, ModalActions, ModalCancelButton, ModalSubmitButton } from './ui/modal'

interface CreateEnvironmentModalProps {
  onCancel: () => void
  onCreate: (data: { name: string }) => Promise<void>
}

export function CreateEnvironmentModal({ onCancel, onCreate }: CreateEnvironmentModalProps) {
  const { dict } = useThemeContext()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = validateEnvironmentForm(name)
    if (!result.valid || !result.data) {
      setError(result.error)
      return
    }
    setError(undefined)
    setSubmitting(true)
    try {
      await onCreate(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create environment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal as="form" onSubmit={handleSubmit} urgent>
      <h2 className="text-[15px] font-semibold text-ink">{dict.createEnvironment}</h2>

      <label className="mb-[6px] mt-5 block font-mono text-label uppercase tracking-[0.08em] text-ink-muted" htmlFor="environment-name">
        {dict.environmentName}
      </label>
      <input
        id="environment-name"
        placeholder="staging"
        autoFocus
        className="mb-4 w-full rounded-lg border border-border bg-canvas px-3 py-[9px] text-sm text-ink outline-none transition-colors"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {error && <p className="-mt-3 mb-3 text-xs text-destructive">{error}</p>}

      <ModalActions>
        <ModalCancelButton onClick={onCancel}>{dict.cancel}</ModalCancelButton>
        <ModalSubmitButton disabled={submitting}>
          {submitting ? 'Creating…' : dict.createEnvironment}
        </ModalSubmitButton>
      </ModalActions>
    </Modal>
  )
}
