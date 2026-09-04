import { useEffect } from 'react'
import { useJourneyStore } from '../state/journeyStore'
import { selectQualityTier, type DeviceCapabilities } from '../scene/quality'

/** Cheap, throwaway context probe. Cheaper than mounting a canvas to find out. */
function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return canvas.getContext('webgl2') !== null || canvas.getContext('webgl') !== null
  } catch {
    return false
  }
}

interface NetworkInformation {
  readonly saveData?: boolean
}

function readCapabilities(): DeviceCapabilities {
  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: NetworkInformation
  }

  return {
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    supportsWebGL: supportsWebGL(),
    // A browser that will not say assumes a middling machine, not a great one.
    logicalCores: nav.hardwareConcurrency ?? 4,
    deviceMemoryGb: nav.deviceMemory ?? null,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    saveData: nav.connection?.saveData ?? false,
  }
}

/**
 * Picks the rendering budget once, and re-picks it if the motion preference
 * changes while the page is open — a visitor who turns reduced motion on
 * expects the canvas to disappear, not to wait for a reload.
 */
export function useQualityTier(): void {
  const setQuality = useJourneyStore((state) => state.setQuality)

  useEffect(() => {
    setQuality(selectQualityTier(readCapabilities()))

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => {
      setQuality(selectQualityTier(readCapabilities()))
    }

    motionQuery.addEventListener('change', onChange)
    return () => {
      motionQuery.removeEventListener('change', onChange)
    }
  }, [setQuality])
}
