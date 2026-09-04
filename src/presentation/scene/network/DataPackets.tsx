import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { BufferAttribute, BufferGeometry} from 'three';
import { AdditiveBlending, Color } from 'three'
import { useJourneyStore } from '../../state/journeyStore'
import { ease, revealAmount } from '../reveal'
import type { SceneEdge } from '../sceneGraph'

export interface DataPacketsProps {
  edges: readonly SceneEdge[]
  chapterCount: number
  packetsPerEdge: number
}

interface Packet {
  readonly edgeIndex: number
  offset: number
  readonly speed: number
}

/**
 * Points of light travelling along the connections.
 *
 * This is the detail that makes the graph read as a *network* rather than a
 * diagram: something is moving through it. Packets are hidden by collapsing
 * them onto their own start point when their edge is not yet revealed, which
 * costs nothing compared with resizing the buffer.
 */
export function DataPackets({ edges, chapterCount, packetsPerEdge }: DataPacketsProps) {
  const geometryRef = useRef<BufferGeometry>(null)

  const packets = useMemo<Packet[]>(() => {
    const list: Packet[] = []

    edges.forEach((_edge, edgeIndex) => {
      for (let i = 0; i < packetsPerEdge; i += 1) {
        list.push({
          edgeIndex,
          // Deterministic spacing and speed: no Math.random, so the traffic
          // pattern is identical on every visit.
          offset: (i + 1) / (packetsPerEdge + 1),
          speed: 0.12 + ((edgeIndex * 7 + i * 3) % 11) * 0.016,
        })
      }
    })

    return list
  }, [edges, packetsPerEdge])

  const positions = useMemo(() => new Float32Array(packets.length * 3), [packets])

  // Above 1 on purpose: this is what pushes the packets past the bloom threshold.
  const packetColor = useMemo(() => new Color().setRGB(1.4, 3.2, 2.8), [])

  useLayoutEffect(() => {
    positions.fill(0)
  }, [positions])

  useFrame((_, delta) => {
    const geometry = geometryRef.current
    if (geometry === null || packets.length === 0) return

    const { progress } = useJourneyStore.getState()

    packets.forEach((packet, index) => {
      const edge = edges[packet.edgeIndex]
      if (edge === undefined) return

      packet.offset = (packet.offset + packet.speed * delta) % 1

      const revealed = ease(revealAmount(edge.chapterIndex, chapterCount, progress))
      const t = revealed > 0.6 ? packet.offset : 0

      const base = index * 3
      for (let axis = 0; axis < 3; axis += 1) {
        const from = edge.from[axis] ?? 0
        const to = edge.to[axis] ?? 0
        positions[base + axis] = from + (to - from) * t
      }
    })

    const attribute = geometry.getAttribute('position') as BufferAttribute | undefined
    if (attribute !== undefined) {
      attribute.needsUpdate = true
    }
  })

  if (packets.length === 0) return null

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.11}
        color={packetColor}
        sizeAttenuation
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}
