import type { DeploymentStatus } from './types'

export function statusLabel(status: DeploymentStatus | null | undefined): string {
  return status ?? 'no deploys'
}

export function isPulsing(status: DeploymentStatus | null | undefined): boolean {
  return status === 'building' || status === 'pushing' || status === 'provisioning'
}
