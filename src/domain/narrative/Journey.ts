import { DomainError, invariant } from '../shared/DomainError'
import { requireUnique } from '../shared/guards'
import type { Chapter } from './Chapter'
import type { Edge } from './Edge'
import type { NarrativeNode } from './NarrativeNode'

export interface JourneyProps {
  readonly chapters: readonly Chapter[]
  readonly nodes: readonly NarrativeNode[]
  readonly edges: readonly Edge[]
}

export interface ProgressRange {
  readonly start: number
  readonly end: number
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

/**
 * The story, as a graph.
 *
 * Aggregate root. Nothing outside this class may assemble chapters, nodes and
 * edges into a whole, which is what lets the invariants below actually hold:
 * an orphan edge or an empty chapter is not a rendering glitch to debug later,
 * it is a `Journey` that never got constructed.
 *
 * It also owns the mapping from scroll progress to narrative position, so the
 * camera rig and the DOM overlay read the same answer from the same place.
 */
export class Journey {
  private readonly nodeIndex: ReadonlyMap<string, NarrativeNode>
  private readonly chapterIndexById: ReadonlyMap<string, number>

  private constructor(
    readonly chapters: readonly Chapter[],
    readonly nodes: readonly NarrativeNode[],
    readonly edges: readonly Edge[],
  ) {
    this.nodeIndex = new Map(nodes.map((node) => [node.id, node]))
    this.chapterIndexById = new Map(chapters.map((chapter) => [chapter.id, chapter.index]))
    Object.freeze(this)
  }

  static create({ chapters, nodes, edges }: JourneyProps): Journey {
    invariant(chapters.length > 0, 'A journey needs at least one chapter')

    requireUnique(chapters, (chapter) => chapter.id, 'Chapter ids')
    requireUnique(nodes, (node) => node.id, 'Node ids')

    const ordered = [...chapters].sort((a, b) => a.index - b.index)
    ordered.forEach((chapter, position) => {
      invariant(
        chapter.index === position,
        `Chapter indices must run contiguously from 0; expected ${position} but "${chapter.id}" is ${chapter.index}`,
      )
    })

    const chapterIds = new Set(ordered.map((chapter) => chapter.id))
    const nodeIds = new Set(nodes.map((node) => node.id))

    for (const node of nodes) {
      invariant(
        chapterIds.has(node.chapterId),
        `Node "${node.id}" belongs to unknown chapter "${node.chapterId}"`,
      )
    }

    for (const chapter of ordered) {
      invariant(
        nodes.some((node) => node.chapterId === chapter.id),
        `Chapter "${chapter.id}" has no nodes, so it would render as an empty beat`,
      )

      if (chapter.focusNodeId !== null) {
        const focus = nodes.find((node) => node.id === chapter.focusNodeId)
        invariant(
          focus !== undefined && focus.chapterId === chapter.id,
          `Chapter "${chapter.id}" focuses node "${chapter.focusNodeId}", which is not one of its own nodes`,
        )
      }
    }

    for (const edge of edges) {
      invariant(nodeIds.has(edge.from), `Edge "${edge.id}" starts at unknown node "${edge.from}"`)
      invariant(nodeIds.has(edge.to), `Edge "${edge.id}" ends at unknown node "${edge.to}"`)
    }

    return new Journey(Object.freeze(ordered), Object.freeze([...nodes]), Object.freeze([...edges]))
  }

  get chapterCount(): number {
    return this.chapters.length
  }

  nodeById(id: string): NarrativeNode | null {
    return this.nodeIndex.get(id) ?? null
  }

  nodesOf(chapterId: string): readonly NarrativeNode[] {
    return this.nodes.filter((node) => node.chapterId === chapterId)
  }

  neighboursOf(nodeId: string): readonly string[] {
    return this.edges.flatMap((edge) => {
      const other = edge.otherEnd(nodeId)
      return other === null ? [] : [other]
    })
  }

  /** The slice of the 0..1 scroll range this chapter occupies. */
  progressRangeOf(chapterId: string): ProgressRange {
    const index = this.chapterIndexById.get(chapterId)
    if (index === undefined) {
      throw new DomainError(`Unknown chapter "${chapterId}"`)
    }

    return { start: index / this.chapterCount, end: (index + 1) / this.chapterCount }
  }

  /** Out-of-range progress clamps rather than throws: scroll is untrusted input. */
  chapterAtProgress(progress: number): Chapter {
    const position = Math.min(
      this.chapterCount - 1,
      Math.floor(clampUnit(progress) * this.chapterCount),
    )

    const chapter = this.chapters[position]
    invariant(chapter !== undefined, 'Chapter lookup fell outside the journey')
    return chapter
  }

  /** How far through the active chapter the given global progress sits, 0..1. */
  localProgressAt(progress: number): number {
    const { start, end } = this.progressRangeOf(this.chapterAtProgress(progress).id)
    return clampUnit((clampUnit(progress) - start) / (end - start))
  }

  /** Nodes belonging to this chapter or any before it. Drives the build-up reveal. */
  nodesRevealedAt(chapterIndex: number): readonly NarrativeNode[] {
    return this.nodes.filter((node) => {
      const index = this.chapterIndexById.get(node.chapterId)
      return index !== undefined && index <= chapterIndex
    })
  }

  /** An edge appears only once both of its endpoints have been revealed. */
  edgesRevealedAt(chapterIndex: number): readonly Edge[] {
    const revealed = new Set(this.nodesRevealedAt(chapterIndex).map((node) => node.id))
    return this.edges.filter((edge) => revealed.has(edge.from) && revealed.has(edge.to))
  }
}
