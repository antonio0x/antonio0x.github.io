import type { Journey } from '@domain/narrative/Journey'
import type { GraphLayoutService, NodePlacement } from '@domain/ports/GraphLayoutService'
import type { Vec3 } from '@domain/shared/Vec3'

export interface HelixLayoutOptions {
  /** Distance of each chapter cluster from the central axis. */
  readonly helixRadius?: number
  /** How far the story descends between chapters. */
  readonly verticalStep?: number
  /** How far around the axis each chapter turns, in radians. */
  readonly turnPerChapter?: number
  /** Radius of the sphere a chapter's satellite nodes sit on. */
  readonly clusterRadius?: number
}

const DEFAULTS = {
  helixRadius: 9,
  verticalStep: 14,
  turnPerChapter: Math.PI * 0.62,
  clusterRadius: 4.4,
} as const

/** Golden angle: the classic way to spread points on a sphere without clumping. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/**
 * Deterministic hash of a node id, in the 0..1 range.
 *
 * Used for jitter instead of Math.random so the network looks organic but
 * lands in exactly the same place on every reload — a portfolio that
 * rearranges itself between visits reads as broken, not alive.
 */
function hashUnit(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return ((hash >>> 0) % 10000) / 10000
}

/**
 * Lays the journey out as a descending helix of clusters.
 *
 * One cluster per chapter, each rotated around a central axis and dropped
 * below the last, so scrolling the story is a continuous descent rather than a
 * series of cuts. The chapter's focus node sits dead centre; everything else
 * orbits it on a Fibonacci sphere, which distributes points evenly no matter
 * how many there are.
 *
 * Implements the GraphLayoutService port, so a force-directed alternative can
 * replace it without the scene components noticing.
 */
export class HelixGraphLayout implements GraphLayoutService {
  private readonly options: Required<HelixLayoutOptions>

  constructor(options: HelixLayoutOptions = {}) {
    this.options = { ...DEFAULTS, ...options }
  }

  /** Where a chapter's cluster sits. Exposed so the camera rig can aim at it. */
  chapterCentre(chapterIndex: number): Vec3 {
    const { helixRadius, verticalStep, turnPerChapter } = this.options
    const angle = chapterIndex * turnPerChapter

    return [
      Math.cos(angle) * helixRadius,
      -chapterIndex * verticalStep,
      Math.sin(angle) * helixRadius,
    ]
  }

  place(journey: Journey): readonly NodePlacement[] {
    return journey.chapters.flatMap((chapter) => {
      const centre = this.chapterCentre(chapter.index)
      const nodes = journey.nodesOf(chapter.id)
      const satellites = nodes.filter((node) => node.id !== chapter.focusNodeId)

      const placements: NodePlacement[] = nodes
        .filter((node) => node.id === chapter.focusNodeId)
        .map((node) => ({ nodeId: node.id, position: centre }))

      satellites.forEach((node, index) => {
        placements.push({
          nodeId: node.id,
          position: this.satellitePosition(centre, index, satellites.length, node.id),
        })
      })

      return placements
    })
  }

  /** Fibonacci sphere point, nudged by a hash of the node id. */
  private satellitePosition(centre: Vec3, index: number, total: number, nodeId: string): Vec3 {
    const { clusterRadius } = this.options

    // Offsetting by 0.5 keeps a lone satellite off the poles, where it would
    // sit directly above the anchor and read as a rendering mistake.
    const y = total === 1 ? 0 : 1 - ((index + 0.5) / total) * 2
    const ringRadius = Math.sqrt(Math.max(0, 1 - y * y))
    const angle = GOLDEN_ANGLE * index

    const jitter = 0.85 + hashUnit(nodeId) * 0.3
    const radius = clusterRadius * jitter

    return [
      centre[0] + Math.cos(angle) * ringRadius * radius,
      centre[1] + y * radius,
      centre[2] + Math.sin(angle) * ringRadius * radius,
    ]
  }
}
