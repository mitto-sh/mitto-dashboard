'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { validateProjectForm } from '@/lib/validation'
import { Modal, ModalActions, ModalCancelButton, ModalSubmitButton } from '@/components/ui/modal'
import type { Project } from '@/lib/types'

interface CreateProjectModalProps {
  onCancel: () => void
  onCreated: (project: Project) => void
}

export function CreateProjectModal({ onCancel, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = validateProjectForm(name)
    if (!result.valid || !result.data) {
      setError(result.error ?? 'Invalid name')
      return
    }
    setError(null)
    setCreating(true)
    try {
      const project = await api.createProject(result.data)
      onCreated(project)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create project')
      setCreating(false)
    }
  }

  return (
    <Modal as="form" onSubmit={handleSubmit} width={380}>
      <h2 className="mb-5 text-[15px] font-semibold text-ink">New project</h2>

      <label className="mb-[6px] block font-mono text-label uppercase tracking-[0.08em] text-ink-muted" htmlFor="new-project-name">
        Name
      </label>
      <input
        id="new-project-name"
        autoFocus
        placeholder="my-app"
        className="mb-1 w-full rounded-lg border border-border bg-canvas px-3 py-[9px] text-sm text-ink outline-none transition-colors"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {error && <p className="mb-4 mt-1 text-xs text-destructive">{error}</p>}

      <ModalActions className="mt-4">
        <ModalCancelButton onClick={onCancel}>Cancel</ModalCancelButton>
        <ModalSubmitButton disabled={creating}>{creating ? 'Creating…' : 'Create'}</ModalSubmitButton>
      </ModalActions>
    </Modal>
  )
}
