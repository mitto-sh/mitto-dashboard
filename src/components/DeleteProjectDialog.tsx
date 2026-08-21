'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Modal, ModalActions, ModalCancelButton, ModalSubmitButton } from './ui/modal'
import type { Project } from '@/lib/types'

interface DeleteProjectDialogProps {
  project: Project
  onCancel: () => void
  onDeleted: () => void
}

export function DeleteProjectDialog({ project, onCancel, onDeleted }: DeleteProjectDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      await api.deleteProject(project.id)
      onDeleted()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete project')
      setDeleting(false)
    }
  }

  return (
    <Modal urgent width={380}>
      <h2 className="mb-2 text-[15px] font-semibold text-ink">Delete project</h2>
      <p className="mb-5 text-sm text-ink-secondary">
        Delete <strong>{project.name}</strong> and all its services? This can't be undone.
      </p>
      {error && <p className="mb-3 text-xs text-destructive">{error}</p>}
      <ModalActions className="mt-0">
        <ModalCancelButton onClick={onCancel}>Keep project</ModalCancelButton>
        <ModalSubmitButton type="button" onClick={handleDelete} disabled={deleting} danger>
          {deleting ? 'Deleting…' : 'Delete'}
        </ModalSubmitButton>
      </ModalActions>
    </Modal>
  )
}
