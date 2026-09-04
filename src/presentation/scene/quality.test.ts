import { describe, expect, it } from 'vitest'
import {
  degrade,
  QUALITY_PRESETS,
  selectQualityTier,
  type DeviceCapabilities,
} from './quality'

const capable: DeviceCapabilities = {
  prefersReducedMotion: false,
  supportsWebGL: true,
  logicalCores: 16,
  deviceMemoryGb: 16,
  coarsePointer: false,
  saveData: false,
}

const on = (overrides: Partial<DeviceCapabilities>): DeviceCapabilities => ({
  ...capable,
  ...overrides,
})

describe('selectQualityTier', () => {
  describe('absolute rules', () => {
    it('honours a reduced-motion preference above everything else', () => {
      expect(selectQualityTier(on({ prefersReducedMotion: true }))).toBe('static')
    })

    it('falls back to static without WebGL, however powerful the device', () => {
      expect(selectQualityTier(on({ supportsWebGL: false, logicalCores: 32 }))).toBe('static')
    })

    it('keeps reduced motion decisive even on a top-end machine', () => {
      expect(
        selectQualityTier(on({ prefersReducedMotion: true, logicalCores: 32, deviceMemoryGb: 64 })),
      ).toBe('static')
    })
  })

  describe('graded decisions', () => {
    it('gives a powerful desktop the full experience', () => {
      expect(selectQualityTier(capable)).toBe('high')
    })

    it('steps down for a modest desktop', () => {
      expect(selectQualityTier(on({ logicalCores: 8 }))).toBe('medium')
    })

    it('treats a low core count as low end', () => {
      expect(selectQualityTier(on({ logicalCores: 4 }))).toBe('low')
    })

    it('trusts reported memory over core count', () => {
      expect(selectQualityTier(on({ logicalCores: 16, deviceMemoryGb: 4 }))).toBe('low')
    })

    it('caps a touch device at medium even when it is fast', () => {
      expect(selectQualityTier(on({ coarsePointer: true, logicalCores: 8 }))).toBe('medium')
    })

    it('drops a slow touch device to low', () => {
      expect(selectQualityTier(on({ coarsePointer: true, logicalCores: 6 }))).toBe('low')
    })

    it('respects an explicit data-saving request', () => {
      expect(selectQualityTier(on({ saveData: true, logicalCores: 32 }))).toBe('low')
    })

    it('still decides when the browser reports no memory at all', () => {
      expect(selectQualityTier(on({ deviceMemoryGb: null }))).toBe('high')
    })
  })
})

describe('degrade', () => {
  it('steps down one rung at a time', () => {
    expect(degrade('high')).toBe('medium')
    expect(degrade('medium')).toBe('low')
  })

  it('never degrades below low, and never touches static', () => {
    expect(degrade('low')).toBe('low')
    expect(degrade('static')).toBe('static')
  })
})

describe('QUALITY_PRESETS', () => {
  it('never asks a lower tier to do more work than a higher one', () => {
    const { high, medium, low } = QUALITY_PRESETS

    expect(high.dpr[1]).toBeGreaterThanOrEqual(medium.dpr[1])
    expect(medium.dpr[1]).toBeGreaterThanOrEqual(low.dpr[1])
    expect(high.packetsPerEdge).toBeGreaterThanOrEqual(medium.packetsPerEdge)
    expect(medium.packetsPerEdge).toBeGreaterThanOrEqual(low.packetsPerEdge)
    expect(high.ambientDensity).toBeGreaterThan(low.ambientDensity)
  })

  it('turns post-processing off at the lowest tier', () => {
    expect(QUALITY_PRESETS.low.bloom).toBe(false)
    expect(QUALITY_PRESETS.low.packets).toBe(false)
  })
})
