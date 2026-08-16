import { getToken, clearToken } from './auth'
import type {
  Project, Service, ServiceType, RepoProvider, Deployment, EnvVar, User,
  GithubInstallation, GithubRepo, RepoConfigResult,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  if (res.status === 204) return undefined as T

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 401) {
      clearToken()
      if (typeof window !== 'undefined') window.location.href = '/login'
    }
    throw new ApiError(res.status, body.error ?? `Request failed with status ${res.status}`)
  }

  return body as T
}

export function githubLoginUrl(): string {
  return `${API_URL}/auth/github`
}

export const api = {
  me: () => request<User>('/auth/me'),

  listProjects: () => request<Project[]>('/projects'),
  createProject: (data: { name: string }) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  deleteProject: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),

  createService: (data: {
    projectId: string
    name: string
    type: ServiceType
    port?: number
    repoUrl?: string
    repoProvider?: RepoProvider
    defaultBranch?: string
    buildCommand?: string
    startCommand?: string
    dockerfilePath?: string
  }) =>
    request<Service>('/services', { method: 'POST', body: JSON.stringify(data) }),
  deleteService: (id: string) => request<void>(`/services/${id}`, { method: 'DELETE' }),

  listDeployments: (serviceId: string) =>
    request<Deployment[]>(`/deployments?serviceId=${serviceId}`),
  triggerDeployment: (serviceId: string) =>
    request<Deployment>('/deployments', { method: 'POST', body: JSON.stringify({ serviceId }) }),
  cancelDeployment: (id: string) =>
    request<Deployment>(`/deployments/${id}/cancel`, { method: 'POST' }),

  listEnvVars: (serviceId: string) => request<EnvVar[]>(`/env/${serviceId}`),
  upsertEnvVars: (serviceId: string, vars: Array<{ key: string; value: string; isSecret: boolean }>) =>
    request<EnvVar[]>(`/env/${serviceId}`, { method: 'PUT', body: JSON.stringify({ vars }) }),
  deleteEnvVar: (serviceId: string, key: string) =>
    request<void>(`/env/${serviceId}/${key}`, { method: 'DELETE' }),

  githubInstallUrl: () => request<{ url: string }>('/github/install-url'),
  listGithubInstallations: () => request<GithubInstallation[]>('/github/installations'),
  listInstallationRepos: (installationId: string) =>
    request<GithubRepo[]>(`/github/installations/${installationId}/repos`),
  getRepoConfig: (installationId: string, owner: string, repo: string) =>
    request<RepoConfigResult>(`/github/installations/${installationId}/repos/${owner}/${repo}/config`),
}
