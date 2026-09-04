import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { BufferAttribute, BufferGeometry, LineSegments } from 'three'
import { useJourneyStore } from '../../state/journeyStore'
import { EDGE_COLOR } from '../nodeStyle'
import { damp, ease, revealAmount } from '../reveal'
import type { SceneEdge } from '../sceneGraph'

export interface EdgeFieldProps {
  edges: readonly SceneEdge[]
  chapterCount: number
}

/**
 * The connections, as one line-segment batch.
 *
 * WebGL caps line width at 1px on most drivers, so the sense of weight comes
 * from colour rather than thickness — and colour is exactly what makes the
 * reveal possible: fading a segment towards black on a near-black background
 * is indistinguishable from it not being drawn, without rebuilding geometry or
 * paying for a transparent-material sort every frame.
 */
export function EdgeField({ edges, chapterCount }: EdgeFieldProps) {
  const geometryRef = useRef<BufferGeometry>(null)
  const linesRef = useRef<LineSegments>(null)
  const currentAlpha = useRef<Float32Array>(new Float32Array(edges.length))

  const positions = useMemo(() => {
    const array = new Float32Array(edges.length * 6)

    edges.forEach((edge, index) => {
      array.set(edge.from, index * 6)
      array.set(edge.to, index * 6 + 3)
    })

    return array
  }, [edges])

  const colors = useMemo(() => new Float32Array(edges.length * 6), [edges])

  useLayoutEffect(() => {
    currentAlpha.current = new Float32Array(edges.length)
  }, [edges])

  useFrame((_, delta) => {
    const geometry = geometryRef.current
    if (geometry === null) return

    const { progress, hoveredNodeId } = useJourneyStore.getState()
    const alphas = currentAlpha.current
    const [r, g, b] = EDGE_COLOR

    edges.forEach((edge, index) => {
      const target = ease(revealAmount(edge.chapterIndex, chapterCount, progress))
      const next = damp(alphas[index] ?? 0, target, 6, delta)
      alphas[index] = next

      /*
       * A line that touches the node being pointed at is the whole point of
       * the gesture: it is the visible answer to "what is this connected to".
       * Everything else steps back so the answer is not buried in the mesh.
       */
      const touched =
        hoveredNodeId !== null && (edge.fromId === hoveredNodeId || edge.toId === hoveredNodeId)
      const emphasis = hoveredNodeId === null ? 1 : touched ? 4.2 : 0.22

      const intensity = next * (0.35 + edge.strength * 0.85) * emphasis
      const offset = index * 6

      for (const vertex of [0, 3]) {
        colors[offset + vertex] = r * intensity
        colors[offset + vertex + 1] = g * intensity
        colors[offset + vertex + 2] = b * intensity
      }
    })

    const attribute = geometry.getAttribute('color') as BufferAttribute | undefined
    if (attribute !== undefined) {
      attribute.needsUpdate = true
    }
  })

  return (
    <lineSegments ref={linesRef} frustumCulled={false}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors toneMapped={false} />
    </lineSegments>
  )
}
