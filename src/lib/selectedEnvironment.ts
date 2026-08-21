function storageKey(projectId: string): string {
  return `mitto_selected_environment_${projectId}`
}

export function getSelectedEnvironmentId(projectId: string): string | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage.getItem(storageKey(projectId))
  } catch {
    return null
  }
}

export function setSelectedEnvironmentId(projectId: string, environmentId: string): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(storageKey(projectId), environmentId)
  } catch {
    // ignore
  }
}
