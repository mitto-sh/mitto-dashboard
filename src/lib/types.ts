export interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  plan: string
}

export interface Project {
  id: string
  name: string
  slug: string
  region: string
  isPrivate: boolean
  enabled: boolean
  services?: Service[]
}

export type ServiceType = 'web' | 'worker' | 'cron' | 'static'
export type RepoProvider = 'github' | 'gitlab' | 'bitbucket'

export interface Service {
  id: string
  projectId: string
  name: string
  type: ServiceType
  port: number | null
  cpu: number
  memory: number
  repoUrl: string | null
  repoProvider: RepoProvider | null
  defaultBranch: string
  buildCommand: string | null
  startCommand: string | null
  outputDir: string | null
  runtime: string | null
}

export type DeploymentStatus =
  | 'queued'
  | 'building'
  | 'pushing'
  | 'provisioning'
  | 'live'
  | 'failed'
  | 'cancelled'

export interface Deployment {
  id: string
  serviceId: string
  status: DeploymentStatus
  commitSha: string | null
  commitMessage: string | null
  deployUrl: string | null
  errorMessage: string | null
  createdAt: string
}

export interface EnvVar {
  id: string
  serviceId: string
  key: string
  value: string
  isSecret: boolean
}

export interface GithubInstallation {
  id: string
  installationId: string
  accountLogin: string
  accountType: 'User' | 'Organization'
}

export interface GithubRepo {
  id: number
  name: string
  full_name: string
  private: boolean
  default_branch: string
  html_url: string
}

export interface MittoServiceConfig {
  name: string
  type: ServiceType
  port?: number
  buildCommand?: string
  startCommand?: string
  dockerfilePath?: string
}

export type RepoConfigResult =
  | { found: false }
  | { found: true; valid: true; config: { services: MittoServiceConfig[] } }
  | { found: true; valid: false; error: string }
