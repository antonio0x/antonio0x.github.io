import type { Journey } from '@domain/narrative/Journey'
import type { NodeKind } from '@domain/narrative/NarrativeNode'
import type { GraphLayoutService } from '@domain/ports/GraphLayoutService'
import type { Vec3 } from '@domain/shared/Vec3'

export interface SceneNode {
  readonly id: string
  readonly kind: NodeKind
  readonly label: string
  readonly weight: number
  readonly chapterIndex: number
  readonly position: Vec3
}

export interface SceneEdge {
  readonly id: string
  readonly from: Vec3
  readonly to: Vec3
  readonly strength: number
  /**
   * The later of its two endpoints' chapters. An edge cannot appear before
   * both of the things it connects exist.
   */
  readonly chapterIndex: number
}

export interface SceneGraph {
  readonly nodes: readonly SceneNode[]
  readonly edges: readonly SceneEdge[]
  readonly chapterCount: number
  /**
   * One point per chapter: the centre of mass of its nodes.
   *
   * Derived from the placements rather than asked of the layout, so the camera
   * path keeps working if the layout strategy is swapped out entirely.
   */
  readonly chapterCentres: readonly Vec3[]
}

/**
 * Flattens the narrative graph and its layout into buffers the renderer wants.
 *
 * Every id lookup and every chapter-index resolution happens once, here,
 * instead of inside a `useFrame` callback running sixty times a second. The
 * scene components receive plain arrays of numbers and do nothing but draw
 * them.
 */
export function buildSceneGraph(journey: Journey, layout: GraphLayoutService): SceneGraph {
  const positions = new Map(layout.place(journey).map((p) => [p.nodeId, p.position]))
  const chapterIndexById = new Map(journey.chapters.map((c) => [c.id, c.index]))

  const nodes: SceneNode[] = journey.nodes.flatMap((node) => {
    const position = positions.get(node.id)
    const chapterIndex = chapterIndexById.get(node.chapterId)

    // A node the layout skipped has nowhere to be drawn. Dropping it beats
    // rendering it at the origin, where it would look like a bug.
    if (position === undefined || chapterIndex === undefined) return []

    return [
      {
        id: node.id,
        kind: node.kind,
        label: node.label,
        weight: node.weight,
        chapterIndex,
        position,
      },
    ]
  })

  const nodeById = new Map(nodes.map((node) => [node.id, node]))

  const edges: SceneEdge[] = journey.edges.flatMap((edge) => {
    const from = nodeById.get(edge.from)
    const to = nodeById.get(edge.to)
    if (from === undefined || to === undefined) return []

    return [
      {
        id: edge.id,
        from: from.position,
        to: to.position,
        strength: edge.strength,
        chapterIndex: Math.max(from.chapterIndex, to.chapterIndex),
      },
    ]
  })

  return {
    nodes,
    edges,
    chapterCount: journey.chapterCount,
    chapterCentres: journey.chapters.map((chapter) => centroidOf(nodes, chapter.index)),
  }
}

function centroidOf(nodes: readonly SceneNode[], chapterIndex: number): Vec3 {
  const members = nodes.filter((node) => node.chapterIndex === chapterIndex)
  if (members.length === 0) return [0, -chapterIndex, 0]

  const sum = members.reduce<[number, number, number]>(
    (acc, node) => [acc[0] + node.position[0], acc[1] + node.position[1], acc[2] + node.position[2]],
    [0, 0, 0],
  )

  return [sum[0] / members.length, sum[1] / members.length, sum[2] / members.length]
}
