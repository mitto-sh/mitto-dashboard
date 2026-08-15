'use client'

import { useState } from 'react'
import { validateServiceForm, type ServiceFormInput } from '@/lib/validation'

interface AddServiceModalProps {
  onCancel: () => void
  onCreate: (data: { name: string; type: string; port?: number }) => Promise<void>
}

export function AddServiceModal({ onCancel, onCreate }: AddServiceModalProps) {
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <form
        onSubmit={handleSubmit}
        className="w-80 rounded-lg border border-border bg-surface p-5"
      >
        <h2 className="mb-4 text-sm font-semibold">Add service</h2>

        <label className="mb-1 block text-xs text-gray-400" htmlFor="service-name">Name</label>
        <input
          id="service-name"
          className="mb-1 w-full rounded border border-border bg-canvas px-2 py-1.5 text-sm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <p className="mb-2 text-xs text-red-400">{errors.name}</p>}

        <label className="mb-1 block text-xs text-gray-400" htmlFor="service-type">Type</label>
        <select
          id="service-type"
          className="mb-1 w-full rounded border border-border bg-canvas px-2 py-1.5 text-sm"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="web">web</option>
          <option value="worker">worker</option>
          <option value="cron">cron</option>
          <option value="static">static</option>
        </select>
        {errors.type && <p className="mb-2 text-xs text-red-400">{errors.type}</p>}

        <label className="mb-1 block text-xs text-gray-400" htmlFor="service-port">Port (optional)</label>
        <input
          id="service-port"
          className="mb-1 w-full rounded border border-border bg-canvas px-2 py-1.5 text-sm"
          value={form.port}
          onChange={(e) => setForm({ ...form, port: e.target.value })}
        />
        {errors.port && <p className="mb-2 text-xs text-red-400">{errors.port}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-white px-3 py-1.5 text-sm font-medium text-gray-900 disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
