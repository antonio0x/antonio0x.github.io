import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { InstancedMesh } from 'three'
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
}

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
export function NodeField({ nodes, chapterCount }: NodeFieldProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const currentScale = useRef<Float32Array>(new Float32Array(nodes.length))

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

  useLayoutEffect(() => {
    currentScale.current = new Float32Array(nodes.length)
  }, [nodes])

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (mesh === null) return

    const { progress } = useJourneyStore.getState()
    const scales = currentScale.current

    nodes.forEach((node, index) => {
      const target = ease(revealAmount(node.chapterIndex, chapterCount, progress))
      // Damping keeps the pop-in soft even when the visitor flings the scrollbar.
      const next = damp(scales[index] ?? 0, target, 7, delta)
      scales[index] = next

      const radius = (radii[index] ?? 0.2) * next
      position.set(node.position[0], node.position[1], node.position[2])
      scale.setScalar(Math.max(radius, 0.0001))
      matrix.compose(position, NO_ROTATION, scale)
      mesh.setMatrixAt(index, matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, nodes.length]}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 1]}>
        <instancedBufferAttribute attach="attributes-aColor" args={[colors, 3]} />
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
