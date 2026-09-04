import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Points } from 'three';
import { AdditiveBlending, Color } from 'three'

export interface AmbientFieldProps {
  /** Vertical extent to fill, so the dust follows the whole descent. */
  depth: number
  density: number
}

const BASE_COUNT = 900

/**
 * Slow-drifting dust around the network.
 *
 * Purely atmospheric: it gives the descent a sense of scale and keeps the
 * space between chapters from reading as empty. Positions come from a seeded
 * sequence rather than Math.random so the field is the same on every visit.
 */
export function AmbientField({ depth, density }: AmbientFieldProps) {
  const pointsRef = useRef<Points>(null)

  const positions = useMemo(() => {
    const count = Math.max(1, Math.round(BASE_COUNT * density))
    const array = new Float32Array(count * 3)

    // A cheap deterministic sequence. Good enough for dust, and reproducible.
    let seed = 20260831
    const next = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }

    for (let i = 0; i < count; i += 1) {
      const radius = 12 + next() * 30
      const angle = next() * Math.PI * 2

      array[i * 3] = Math.cos(angle) * radius
      array[i * 3 + 1] = 10 - next() * (depth + 30)
      array[i * 3 + 2] = Math.sin(angle) * radius
    }

    return array
  }, [density, depth])

  const color = useMemo(() => new Color().setRGB(0.16, 0.42, 0.42), [])

  useFrame((_, delta) => {
    if (pointsRef.current !== null) {
      pointsRef.current.rotation.y += delta * 0.012
    }
  })

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        color={color}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}
