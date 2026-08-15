'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthGuard } from '@/components/AuthGuard'
import { api } from '@/lib/api'
import { validateProjectForm } from '@/lib/validation'
import type { Project } from '@/lib/types'

function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.listProjects().then((data) => {
      setProjects(data)
      setLoading(false)
    })
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const result = validateProjectForm(name)
    if (!result.valid || !result.data) {
      setError(result.error ?? 'Invalid name')
      return
    }
    setError(null)
    const project = await api.createProject(result.data)
    setProjects((prev) => [...prev, project])
    setName('')
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-6 text-xl font-semibold">Projects</h1>

      <form onSubmit={handleCreate} className="mb-8 flex gap-2">
        <input
          aria-label="Project name"
          placeholder="New project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded border border-border bg-surface px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded bg-white px-4 py-2 text-sm font-medium text-gray-900">
          Create
        </button>
      </form>
      {error && <p className="-mt-6 mb-6 text-xs text-red-400">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : projects.length === 0 ? (
        <p className="text-sm text-gray-500">No projects yet — create one above.</p>
      ) : (
        <ul className="space-y-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                className="block rounded-lg border border-border bg-surface px-4 py-3 hover:border-gray-500"
              >
                <span className="font-medium">{p.name}</span>
                <span className="ml-2 text-xs text-gray-500">{p.slug}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default function ProjectsPage() {
  return (
    <AuthGuard>
      <ProjectsList />
    </AuthGuard>
  )
}
