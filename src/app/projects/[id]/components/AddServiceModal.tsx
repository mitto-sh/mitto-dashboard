'use client'

import { useState } from 'react'
import { validateServiceForm, type ServiceFormInput } from '@/lib/validation'
import { useThemeContext } from '@/components/ThemeProvider'
import { Modal, ModalActions, ModalCancelButton, ModalSubmitButton } from '@/components/ui/modal'

interface AddServiceModalProps {
  projectSlug: string
  onCancel: () => void
  onCreate: (data: { name: string; type: string; port?: number }) => Promise<void>
}

export function AddServiceModal({ projectSlug, onCancel, onCreate }: AddServiceModalProps) {
  const { dict } = useThemeContext()
  const [form, setForm] = useState<ServiceFormInput>({ name: '', type: 'web', port: '' })
  const [errors, setErrors] = useState<ReturnType<typeof validateServiceForm>['errors']>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = validateServiceForm(form)
    if (!result.valid || !result.data) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      await onCreate(result.data)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal as="form" onSubmit={handleSubmit}>
      <h2 className="text-[15px] font-semibold text-ink">{dict.addService}</h2>
      <p className="mb-5 mt-[6px] font-mono text-xs text-ink-muted">{projectSlug}</p>

      <label className="mb-[6px] block font-mono text-label uppercase tracking-[0.08em] text-ink-muted" htmlFor="service-name">
        {dict.name}
      </label>
      <input
        id="service-name"
        placeholder="gateway"
        className="mb-4 w-full rounded-lg border border-border bg-canvas px-3 py-[9px] text-sm text-ink outline-none transition-colors"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      {errors.name && <p className="-mt-3 mb-3 text-xs text-destructive">{errors.name}</p>}

      <label className="mb-[6px] block font-mono text-label uppercase tracking-[0.08em] text-ink-muted" htmlFor="service-type">
        {dict.type}
      </label>
      <select
        id="service-type"
        className="mb-4 w-full rounded-lg border border-border bg-canvas px-3 py-[9px] text-sm text-ink outline-none"
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
      >
        <option value="web">web</option>
        <option value="worker">worker</option>
        <option value="cron">cron</option>
        <option value="static">static</option>
      </select>
      {errors.type && <p className="-mt-3 mb-3 text-xs text-destructive">{errors.type}</p>}

      <label className="mb-[6px] block font-mono text-label uppercase tracking-[0.08em] text-ink-muted" htmlFor="service-port">
        {dict.port} <span className="normal-case tracking-normal text-ink-faint">{dict.optional}</span>
      </label>
      <input
        id="service-port"
        placeholder="3000"
        className="mb-4 w-full rounded-lg border border-border bg-canvas px-3 py-[9px] font-mono text-caption text-ink outline-none transition-colors"
        value={form.port}
        onChange={(e) => setForm({ ...form, port: e.target.value })}
      />
      {errors.port && <p className="-mt-3 mb-3 text-xs text-destructive">{errors.port}</p>}

      <ModalActions>
        <ModalCancelButton onClick={onCancel}>{dict.cancel}</ModalCancelButton>
        <ModalSubmitButton disabled={submitting}>
          {submitting ? 'Creating…' : dict.createService}
        </ModalSubmitButton>
      </ModalActions>
    </Modal>
  )
}
