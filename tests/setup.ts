import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom has no ResizeObserver; the cmdk package (used by the Command palette)
// measures list dimensions with it on mount.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver

// jsdom doesn't implement scrollIntoView either; cmdk calls it when the
// highlighted item changes.
Element.prototype.scrollIntoView ??= () => {}

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
