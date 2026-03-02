import { config } from '@vue/test-utils'

// Example: stub out transition to avoid timing issues
config.global.stubs = {
  transition: false,
  'transition-group': false,
}

// Mock window.matchMedia for components that might use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
