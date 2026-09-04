import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export interface PerformanceGuardProps {
  /** Frames per second below which the scene is judged too expensive. */
  threshold?: number
  /** Seconds of sustained slowness required before acting. */
  patience?: number
  onDecline: () => void
}

/**
 * Watches the frame rate and calls back once when it will not recover.
 *
 * Hand-rolled rather than pulled from drei: `PerformanceMonitor` was the only
 * thing this project used from that library, and importing it dragged the
 * whole package into the 3D chunk. Twenty lines against a few hundred kilobytes
 * on a phone is not a close call.
 *
 * The first second is ignored on purpose. Shader compilation and texture upload
 * make the opening frames slow on every device, and degrading the scene because
 * of the cost of starting it would punish machines that were about to be fine.
 */
export function PerformanceGuard({
  threshold = 40,
  patience = 1.5,
  onDecline,
}: PerformanceGuardProps) {
  const warmup = useRef(0)
  const slowFor = useRef(0)
  const fired = useRef(false)

  useFrame((_, delta) => {
    if (fired.current || delta <= 0) return

    if (warmup.current < 1) {
      warmup.current += delta
      return
    }

    const fps = 1 / delta
    slowFor.current = fps < threshold ? slowFor.current + delta : 0

    if (slowFor.current >= patience) {
      fired.current = true
      onDecline()
    }
  })

  return null
}
