import type { QualityTier } from '../state/journeyStore'

export interface DeviceCapabilities {
  /** A system-level request for less motion. Always decisive. */
  readonly prefersReducedMotion: boolean
  readonly supportsWebGL: boolean
  /** navigator.hardwareConcurrency, or a conservative guess when unavailable. */
  readonly logicalCores: number
  /** navigator.deviceMemory in GB. Not implemented on Safari or Firefox. */
  readonly deviceMemoryGb: number | null
  readonly coarsePointer: boolean
  /** The visitor asked their browser to save data. */
  readonly saveData: boolean
}

export interface QualityPreset {
  /** Device pixel ratio clamp: [min, max]. */
  readonly dpr: readonly [number, number]
  readonly antialias: boolean
  readonly bloom: boolean
  /** Travelling packets along the edges. The first thing to go. */
  readonly packets: boolean
  readonly packetsPerEdge: number
  /** Multiplier applied to decorative background particles. */
  readonly ambientDensity: number
}

export const QUALITY_PRESETS: Readonly<Record<Exclude<QualityTier, 'static'>, QualityPreset>> = {
  high: { dpr: [1, 2], antialias: true, bloom: true, packets: true, packetsPerEdge: 3, ambientDensity: 1 },
  medium: { dpr: [1, 1.5], antialias: true, bloom: true, packets: true, packetsPerEdge: 1, ambientDensity: 0.55 },
  low: { dpr: [1, 1], antialias: false, bloom: false, packets: false, packetsPerEdge: 0, ambientDensity: 0.25 },
}

/**
 * Chooses a rendering budget from what the device tells us about itself.
 *
 * Pure so the whole decision table can be tested without a browser. Two rules
 * are absolute and come first: a stated motion preference and a missing WebGL
 * context both drop straight to `static`, where no canvas is ever mounted.
 * Everything after that is a graded guess, and it errs downward — a portfolio
 * that stutters reads worse than one that is merely simpler.
 */
export function selectQualityTier(capabilities: DeviceCapabilities): QualityTier {
  if (capabilities.prefersReducedMotion) return 'static'
  if (!capabilities.supportsWebGL) return 'static'
  if (capabilities.saveData) return 'low'

  const { logicalCores, deviceMemoryGb, coarsePointer } = capabilities

  // Reported memory is the strongest signal when the browser offers it.
  if (deviceMemoryGb !== null && deviceMemoryGb <= 4) return 'low'
  if (logicalCores <= 4) return 'low'
  if (coarsePointer) return logicalCores >= 8 ? 'medium' : 'low'
  if (logicalCores <= 8) return 'medium'

  return 'high'
}

/** One step down the ladder. Used when the frame rate cannot hold. */
export function degrade(tier: QualityTier): QualityTier {
  switch (tier) {
    case 'high':
      return 'medium'
    case 'medium':
      return 'low'
    default:
      return tier
  }
}
