import type { DeploymentStatus } from '@/lib/types'

const STYLES: Record<DeploymentStatus, string> = {
  queued:       'bg-gray-700 text-gray-200',
  building:     'bg-amber-900 text-amber-300',
  pushing:      'bg-amber-900 text-amber-300',
  provisioning: 'bg-amber-900 text-amber-300',
  live:         'bg-emerald-900 text-emerald-300',
  failed:       'bg-red-900 text-red-300',
  cancelled:    'bg-gray-800 text-gray-400',
}

export function DeploymentStatusBadge({ status }: { status: DeploymentStatus }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {status}
    </span>
  )
}
