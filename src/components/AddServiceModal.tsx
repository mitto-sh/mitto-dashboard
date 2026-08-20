'use client'

import { useState } from 'react'
import { validateServiceForm, type ServiceFormInput } from '@/lib/validation'
import { useThemeContext } from './ThemeProvider'

interface AddServiceModalProps {
  projectSlug: string
  onCancel: () => void
  onCreate: (data: { name: string; type: string; port?: number }) => Promise<void>
}

export function AddServiceModal({ projectSlug, onCancel, onCreate }: AddServiceModalProps) {
  const { theme, dict } = useThemeContext()
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

  const labelStyle = { color: theme.muted }
  const inputStyle = { borderColor: theme.border, backgroundColor: theme.canvas, color: theme.ink }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-[4px]"
      style={{ backgroundColor: theme.overlay }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-[400px] rounded-[14px] border p-6"
        style={{ borderColor: theme.border, backgroundColor: theme.surface, boxShadow: `0 24px 64px ${theme.panelShadow}` }}
      >
        <h2 className="text-[15px] font-semibold" style={{ color: theme.ink }}>{dict.addService}</h2>
        <p className="mb-5 mt-[6px] font-mono text-xs" style={{ color: theme.muted }}>{projectSlug}</p>

        <label className="mb-[6px] block font-mono text-label uppercase tracking-[0.08em]" style={labelStyle} htmlFor="service-name">
          {dict.name}
        </label>
        <input
          id="service-name"
          placeholder="gateway"
          className="mb-4 w-full rounded-lg border px-3 py-[9px] text-sm outline-none transition-colors"
          style={inputStyle}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <p className="-mt-3 mb-3 text-xs" style={{ color: theme.danger }}>{errors.name}</p>}

        <label className="mb-[6px] block font-mono text-label uppercase tracking-[0.08em]" style={labelStyle} htmlFor="service-type">
          {dict.type}
        </label>
        <select
          id="service-type"
          className="mb-4 w-full rounded-lg border px-3 py-[9px] text-sm outline-none"
          style={inputStyle}
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="web">web</option>
          <option value="worker">worker</option>
          <option value="cron">cron</option>
          <option value="static">static</option>
        </select>
        {errors.type && <p className="-mt-3 mb-3 text-xs" style={{ color: theme.danger }}>{errors.type}</p>}

        <label className="mb-[6px] block font-mono text-label uppercase tracking-[0.08em]" style={labelStyle} htmlFor="service-port">
          {dict.port} <span className="normal-case tracking-normal" style={{ color: theme.faint }}>{dict.optional}</span>
        </label>
        <input
          id="service-port"
          placeholder="3000"
          className="mb-4 w-full rounded-lg border px-3 py-[9px] font-mono text-caption outline-none transition-colors"
          style={inputStyle}
          value={form.port}
          onChange={(e) => setForm({ ...form, port: e.target.value })}
        />
        {errors.port && <p className="-mt-3 mb-3 text-xs" style={{ color: theme.danger }}>{errors.port}</p>}

        <div className="mt-2 flex justify-end gap-[10px]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-[14px] py-[9px] text-sm font-medium transition-colors"
            style={{ color: theme.sec }}
          >
            {dict.cancel}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg px-[18px] py-[9px] text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: theme.accent, color: theme.accentInk }}
          >
            {submitting ? 'Creating…' : dict.createService}
          </button>
        </div>
      </form>
    </div>
  )
}
