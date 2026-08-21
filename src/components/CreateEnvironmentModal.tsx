'use client'

import { useState } from 'react'
import { validateEnvironmentForm } from '@/lib/validation'
import { useThemeContext } from './ThemeProvider'

interface CreateEnvironmentModalProps {
  onCancel: () => void
  onCreate: (data: { name: string }) => Promise<void>
}

export function CreateEnvironmentModal({ onCancel, onCreate }: CreateEnvironmentModalProps) {
  const { theme, dict } = useThemeContext()
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
        <h2 className="text-[15px] font-semibold" style={{ color: theme.ink }}>{dict.createEnvironment}</h2>

        <label className="mb-[6px] mt-5 block font-mono text-label uppercase tracking-[0.08em]" style={labelStyle} htmlFor="environment-name">
          {dict.environmentName}
        </label>
        <input
          id="environment-name"
          placeholder="staging"
          autoFocus
          className="mb-4 w-full rounded-lg border px-3 py-[9px] text-sm outline-none transition-colors"
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error && <p className="-mt-3 mb-3 text-xs" style={{ color: theme.danger }}>{error}</p>}

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
            {submitting ? 'Creating…' : dict.createEnvironment}
          </button>
        </div>
      </form>
    </div>
  )
}
