import { invariant } from '../shared/DomainError'
import { requireText, requireUnitInterval } from '../shared/guards'

export interface EdgeProps {
  readonly from: string
  readonly to: string
  /** Visual weight of the connection, 0..1. Drives line opacity and packet rate. */
  readonly strength?: number
}

const DEFAULT_STRENGTH = 0.5

/**
 * An undirected connection between two nodes.
 *
 * `from` and `to` are kept in the order they were authored so the reveal
 * animation has a direction to travel in, but membership queries treat the
 * edge as undirected.
 */
export class Edge {
  private constructor(
    readonly from: string,
    readonly to: string,
    readonly strength: number,
  ) {
    Object.freeze(this)
  }

  static create(props: EdgeProps): Edge {
    const from = requireText(props.from, 'Edge from')
    const to = requireText(props.to, 'Edge to')
    invariant(from !== to, `Edge cannot connect "${from}" to itself`)

    return new Edge(from, to, requireUnitInterval(props.strength ?? DEFAULT_STRENGTH, 'Edge strength'))
  }

  get id(): string {
    return `${this.from}->${this.to}`
  }

  connects(nodeId: string): boolean {
    return this.from === nodeId || this.to === nodeId
  }

  otherEnd(nodeId: string): string | null {
    if (this.from === nodeId) return this.to
    if (this.to === nodeId) return this.from
    return null
  }
}
