import { describe, it, expect } from 'vitest'
import { validateServiceForm, validateProjectForm } from '@/lib/validation'

describe('validateServiceForm', () => {
  it('accepts a valid form without a port', () => {
    const result = validateServiceForm({ name: 'web', type: 'web', port: '' })
    expect(result.valid).toBe(true)
    expect(result.data).toEqual({ name: 'web', type: 'web', port: undefined })
  })

  it('accepts a valid form with a port', () => {
    const result = validateServiceForm({ name: 'web', type: 'web', port: '3000' })
    expect(result.valid).toBe(true)
    expect(result.data?.port).toBe(3000)
  })

  it('rejects an empty name', () => {
    const result = validateServiceForm({ name: '  ', type: 'web', port: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.name).toBeDefined()
  })

  it('rejects a name over 64 characters', () => {
    const result = validateServiceForm({ name: 'a'.repeat(65), type: 'web', port: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.name).toBeDefined()
  })

  it('rejects an invalid type', () => {
    const result = validateServiceForm({ name: 'web', type: 'bogus', port: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.type).toBeDefined()
  })

  it('rejects a non-numeric port', () => {
    const result = validateServiceForm({ name: 'web', type: 'web', port: 'abc' })
    expect(result.valid).toBe(false)
    expect(result.errors.port).toBeDefined()
  })

  it('rejects a zero or negative port', () => {
    expect(validateServiceForm({ name: 'web', type: 'web', port: '0' }).valid).toBe(false)
    expect(validateServiceForm({ name: 'web', type: 'web', port: '-5' }).valid).toBe(false)
  })
})

describe('validateProjectForm', () => {
  it('accepts and trims a valid name', () => {
    const result = validateProjectForm('  My App  ')
    expect(result.valid).toBe(true)
    expect(result.data).toEqual({ name: 'My App' })
  })

  it('rejects an empty name', () => {
    expect(validateProjectForm('   ').valid).toBe(false)
  })

  it('rejects a name over 64 characters', () => {
    expect(validateProjectForm('a'.repeat(65)).valid).toBe(false)
  })
})
