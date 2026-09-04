import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

/**
 * jsdom implements no media queries at all, and both the quality detector and
 * GSAP's ScrollTrigger call `matchMedia` on load. This stub reports "no match"
 * for everything, which is the honest answer for a headless environment: no
 * reduced-motion preference, no coarse pointer, no narrow viewport.
 *
 * A test that cares about one of these overrides it explicitly.
 */
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

/**
 * jsdom cannot produce a WebGL context, which is exactly the condition the
 * safety-floor tests want: the quality tier resolves to `static` and the canvas
 * is never mounted. Stubbing it explicitly documents that intent instead of
 * relying on a jsdom limitation to hold forever.
 */
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never
}

/**
 * jsdom does not expose Storage in this configuration.
 *
 * The application already treats storage as optional — every access is wrapped
 * in try/catch, because real browsers throw here in private mode. The tests
 * still need somewhere for a remembered language preference to live.
 */
if (typeof window !== 'undefined' && window.localStorage === undefined) {
  const store = new Map<string, string>()

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
      clear: () => {
        store.clear()
      },
      key: (index: number) => [...store.keys()][index] ?? null,
      get length() {
        return store.size
      },
    },
  })
}
