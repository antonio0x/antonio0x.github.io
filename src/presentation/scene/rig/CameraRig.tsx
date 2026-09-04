import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CatmullRomCurve3, Vector3 } from 'three'
import type { Vec3 } from '@domain/shared/Vec3'
import { useJourneyStore } from '../../state/journeyStore'
import { clamp01, damp } from '../reveal'

export interface CameraRigProps {
  chapterCentres: readonly Vec3[]
  /** How far the camera sits from the cluster it is looking at. */
  distance: number
  /**
   * How far to aim to the left of the cluster, as a fraction of `distance`.
   *
   * Aiming off-centre pushes the network towards the right of the frame and
   * leaves the left third clear for the text. Zero on narrow screens, where
   * the content takes the full width and the network belongs behind it.
   */
  lateralBias: number
}

/**
 * Flies the camera along the story.
 *
 * The one rule this file exists to honour: GSAP never touches the camera.
 * ScrollTrigger writes a single number into the store, and this component
 * reads it here, inside R3F's own render loop, and does the interpolation
 * itself. Two libraries, one owner per property, no fight over `position.x`.
 *
 * `getState()` rather than a selector hook is deliberate — subscribing would
 * re-render this component on every scroll frame to produce output React never
 * sees anyway.
 */
export function CameraRig({ chapterCentres, distance, lateralBias }: CameraRigProps) {
  const camera = useThree((state) => state.camera)
  const smoothedProgress = useRef(0)
  const lookTarget = useRef(new Vector3())
  const forward = useRef(new Vector3())
  const sideways = useRef(new Vector3())
  const worldUp = useRef(new Vector3(0, 1, 0))

  const { path, focus } = useMemo(() => {
    const centres = chapterCentres.map(([x, y, z]) => new Vector3(x, y, z))

    if (centres.length === 0) {
      const fallback = [new Vector3(0, 0, 0), new Vector3(0, -1, 0)]
      return { path: new CatmullRomCurve3(fallback), focus: new CatmullRomCurve3(fallback) }
    }

    // A single point cannot make a curve; duplicating it keeps the maths valid
    // for a one-chapter journey rather than crashing on an edge case.
    const focusPoints = centres.length === 1 ? [centres[0]!, centres[0]!.clone()] : centres

    // The camera orbits outside each cluster, pushed away from the central
    // axis so it looks *into* the network instead of sitting inside it.
    const cameraPoints = focusPoints.map((centre, index) => {
      const outward = new Vector3(centre.x, 0, centre.z)
      if (outward.lengthSq() < 0.0001) outward.set(1, 0, 0)
      outward.normalize().multiplyScalar(distance)

      // Alternating the vertical offset stops the descent feeling like a lift shaft.
      const lift = index % 2 === 0 ? distance * 0.22 : distance * 0.05

      return new Vector3(centre.x + outward.x, centre.y + lift, centre.z + outward.z)
    })

    return {
      path: new CatmullRomCurve3(cameraPoints, false, 'catmullrom', 0.35),
      focus: new CatmullRomCurve3(focusPoints, false, 'catmullrom', 0.35),
    }
  }, [chapterCentres, distance])

  useFrame((_, delta) => {
    const { progress } = useJourneyStore.getState()

    // The store already carries GSAP's scrubbed value; this second pass keeps
    // the camera smooth when the visitor jumps with a keyboard or a hash link.
    smoothedProgress.current = damp(smoothedProgress.current, clamp01(progress), 5, delta)
    const t = clamp01(smoothedProgress.current)

    path.getPointAt(t, camera.position)
    focus.getPointAt(t, lookTarget.current)

    // Aim to the left of the cluster so it composes into the right of the
    // frame instead of sitting behind the paragraph the visitor is reading.
    if (lateralBias !== 0) {
      forward.current.subVectors(lookTarget.current, camera.position).normalize()
      sideways.current.crossVectors(forward.current, worldUp.current).normalize()
      lookTarget.current.addScaledVector(sideways.current, -distance * lateralBias)
    }

    camera.lookAt(lookTarget.current)
  })

  return null
}
