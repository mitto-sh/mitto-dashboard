import type { ServiceType } from './types'

const SERVICE_TYPES: ServiceType[] = ['web', 'worker', 'cron', 'static']

export interface ServiceFormInput {
  name: string
  type: string
  port: string
}

export interface ServiceFormResult {
  valid: boolean
  errors: Partial<Record<keyof ServiceFormInput, string>>
  data?: { name: string; type: ServiceType; port?: number }
}

export function validateServiceForm(input: ServiceFormInput): ServiceFormResult {
  const errors: ServiceFormResult['errors'] = {}

  const name = input.name.trim()
  if (!name) errors.name = 'Name is required'
  else if (name.length > 64) errors.name = 'Name must be 64 characters or fewer'

  if (!SERVICE_TYPES.includes(input.type as ServiceType)) {
    errors.type = 'Choose a valid service type'
  }

  let port: number | undefined
  if (input.port.trim() !== '') {
    const parsed = Number(input.port)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      errors.port = 'Port must be a positive integer'
    } else {
      port = parsed
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    errors: {},
    data: { name, type: input.type as ServiceType, port },
  }
}

export interface ProjectFormResult {
  valid: boolean
  error?: string
  data?: { name: string }
}

export function validateProjectForm(name: string): ProjectFormResult {
  const trimmed = name.trim()
  if (!trimmed) return { valid: false, error: 'Name is required' }
  if (trimmed.length > 64) return { valid: false, error: 'Name must be 64 characters or fewer' }
  return { valid: true, data: { name: trimmed } }
}

export function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'project'
  )
}
