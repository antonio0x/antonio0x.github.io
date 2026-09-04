import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { InstancedBufferAttribute, InstancedMesh } from 'three'
import { AdditiveBlending, Matrix4, Quaternion, Vector3 } from 'three'
import { useJourneyStore } from '../../state/journeyStore'
import {
  CORE_TIGHTNESS,
  GLOW_FRAGMENT_SHADER,
  GLOW_VERTEX_SHADER,
  HALO_STRENGTH,
} from '../materials/glowMaterial'
import { FOG_DENSITY, glowRadiusOf, NODE_STYLE } from '../nodeStyle'
import { damp, ease, revealAmount } from '../reveal'
import type { SceneNode } from '../sceneGraph'

export interface NodeFieldProps {
  nodes: readonly SceneNode[]
  chapterCount: number
  /** Node id to its direct connections, for lighting a whole neighbourhood. */
  neighbours: ReadonlyMap<string, ReadonlySet<string>>
}

/**
 * What a node's brightness means once the visitor points at something.
 *
 * The numbers matter less than the gap between them: the ignited node has to
 * be findable in one glance across a field of forty, and the rest have to
 * recede far enough to make that easy without going dark enough to look
 * broken.
 */
const FOCUS = {
  resting: 1,
  ignited: 2.9,
  neighbour: 1.85,
  receded: 0.3,
} as const

const matrix = new Matrix4()
const position = new Vector3()
const scale = new Vector3()
/** The shader billboards each quad itself, so instance rotation is unused. */
const NO_ROTATION = new Quaternion()

/**
 * Every node in the network, in a single draw call.
 *
 * One InstancedMesh rather than one mesh per node: forty separate meshes is
 * forty draw calls and forty React elements re-rendering whenever anything
 * changes. Here React renders once and `useFrame` writes matrices directly,
 * so the reveal animation never touches the component tree.
 *
 * Each instance is a camera-facing quad carrying a radial glow rather than a
 * solid sphere. See `materials/glowMaterial.ts` for why.
 */
export function NodeField({ nodes, chapterCount, neighbours }: NodeFieldProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const currentScale = useRef<Float32Array>(new Float32Array(nodes.length))
  const focusAttribute = useRef<InstancedBufferAttribute>(null)

  const radii = useMemo(
    () => nodes.map((node) => glowRadiusOf(node.kind, node.weight)),
    [nodes],
  )

  /*
   * Colour rides on a plain instanced attribute named `aColor` rather than on
   * Three's `instanceColor`.
   *
   * `instanceColor` only means anything to the built-in materials, which read
   * it through the shader chunks this material replaces. Naming our own
   * attribute keeps the contract visible in the shader that actually consumes
   * it, instead of depending on a define we no longer opt into.
   */
  const colors = useMemo(() => {
    const array = new Float32Array(nodes.length * 3)

    nodes.forEach((node, index) => {
      array.set(NODE_STYLE[node.kind].color, index * 3)
    })

    return array
  }, [nodes])

  const uniforms = useMemo(
    () => ({
      uFogDensity: { value: FOG_DENSITY },
      uCoreTightness: { value: CORE_TIGHTNESS },
      uHaloStrength: { value: HALO_STRENGTH },
    }),
    [],
  )

  /*
   * The live focus buffer, not a copy of one.
   *
   * The instanced attribute below keeps a reference to exactly this array, so
   * the frame loop mutates it in place and flags it. Writing into a separate
   * array would update a buffer nothing ever draws.
   */
  const focusSeed = useMemo(
    () => new Float32Array(nodes.length).fill(FOCUS.resting),
    [nodes],
  )

  useLayoutEffect(() => {
    currentScale.current = new Float32Array(nodes.length)
  }, [nodes])

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (mesh === null) return

    const { progress, hoveredNodeId } = useJourneyStore.getState()
    const scales = currentScale.current
    const focuses = focusSeed
    const adjacent = hoveredNodeId === null ? undefined : neighbours.get(hoveredNodeId)

    nodes.forEach((node, index) => {
      const target = ease(revealAmount(node.chapterIndex, chapterCount, progress))
      // Damping keeps the pop-in soft even when the visitor flings the scrollbar.
      const next = damp(scales[index] ?? 0, target, 7, delta)
      scales[index] = next

      const focusTarget =
        hoveredNodeId === null
          ? FOCUS.resting
          : node.id === hoveredNodeId
            ? FOCUS.ignited
            : adjacent?.has(node.id) === true
              ? FOCUS.neighbour
              : FOCUS.receded

      // Faster than the reveal: pointing at something should feel immediate,
      // where arriving at a chapter should feel like arriving.
      const focusNext = damp(focuses[index] ?? FOCUS.resting, focusTarget, 14, delta)
      focuses[index] = focusNext

      // The ignited node grows a little as well as brightening. Brightness
      // alone reads as a colour change; size is what reads as "this one".
      const swell = 1 + Math.max(0, focusNext - FOCUS.resting) * 0.24
      const radius = (radii[index] ?? 0.2) * next * swell
      position.set(node.position[0], node.position[1], node.position[2])
      scale.setScalar(Math.max(radius, 0.0001))
      matrix.compose(position, NO_ROTATION, scale)
      mesh.setMatrixAt(index, matrix)
    })

    mesh.instanceMatrix.needsUpdate = true

    if (focusAttribute.current !== null) {
      focusAttribute.current.needsUpdate = true
    }
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, nodes.length]}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 1]}>
        <instancedBufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <instancedBufferAttribute
          ref={focusAttribute}
          attach="attributes-aFocus"
          args={[focusSeed, 1]}
        />
      </planeGeometry>
      <shaderMaterial
        vertexShader={GLOW_VERTEX_SHADER}
        fragmentShader={GLOW_FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  )
}
