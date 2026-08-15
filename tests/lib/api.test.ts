import { describe, it, expect, vi, afterEach } from 'vitest'
import { api, ApiError, githubLoginUrl } from '@/lib/api'
import { setToken } from '@/lib/auth'

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  }))
}

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds the GitHub login URL from the configured API base', () => {
    expect(githubLoginUrl()).toMatch(/\/auth\/github$/)
  })

  it('sends the bearer token when one is stored', async () => {
    setToken('my-token')
    const fetchMock = vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => [] })
    vi.stubGlobal('fetch', fetchMock)

    await api.listProjects()

    const [, init] = fetchMock.mock.calls[0]!
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer my-token')
  })

  it('omits the Authorization header when no token is stored', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => [] })
    vi.stubGlobal('fetch', fetchMock)

    await api.listProjects()

    const [, init] = fetchMock.mock.calls[0]!
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('returns parsed JSON on success', async () => {
    mockFetchOnce(200, [{ id: '1', name: 'Test' }])
    const result = await api.listProjects()
    expect(result).toEqual([{ id: '1', name: 'Test' }])
  })

  it('returns undefined for 204 responses', async () => {
    mockFetchOnce(204, {})
    const result = await api.deleteProject('id-1')
    expect(result).toBeUndefined()
  })

  it('throws ApiError with the server message on failure', async () => {
    mockFetchOnce(404, { error: 'Project not found' })
    await expect(api.getProject('missing')).rejects.toThrow(ApiError)
    await expect(api.getProject('missing')).rejects.toThrow('Project not found')
  })

  it('falls back to a generic message when the error body has no error field', async () => {
    mockFetchOnce(500, {})
    await expect(api.getProject('x')).rejects.toThrow('Request failed with status 500')
  })

  it('exercises every remaining endpoint wrapper', async () => {
    mockFetchOnce(200, {})
    await api.me()
    await api.createProject({ name: 'x' })
    await api.createService({ projectId: 'p1', name: 'web', type: 'web' })
    await api.deleteService('svc-1')
    await api.listDeployments('svc-1')
    await api.triggerDeployment('svc-1')
    await api.cancelDeployment('dep-1')
    await api.listEnvVars('svc-1')
    await api.upsertEnvVars('svc-1', [{ key: 'K', value: 'v', isSecret: false }])
    await api.deleteEnvVar('svc-1', 'K')
  })
})
