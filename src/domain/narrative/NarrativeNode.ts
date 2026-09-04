import { requireText, requireUnitInterval } from '../shared/guards'

/**
 * What a node stands for in the story. The renderer maps each kind to its own
 * geometry and colour, so this is a closed set on purpose.
 */
export type NodeKind =
  | 'identity'
  | 'milestone'
  | 'skill'
  | 'setup'
  | 'role'
  | 'project'
  | 'horizon'
  | 'contact'

export interface NarrativeNodeProps {
  readonly id: string
  readonly chapterId: string
  readonly kind: NodeKind
  readonly label: string
  /** Relative visual prominence, 0..1. Drives node scale and glow. */
  readonly weight?: number
}

const DEFAULT_WEIGHT = 0.5

/** A single point in the network: a skill, a role, a milestone, a project. */
export class NarrativeNode {
  private constructor(
    readonly id: string,
    readonly chapterId: string,
    readonly kind: NodeKind,
    readonly label: string,
    readonly weight: number,
  ) {
    Object.freeze(this)
  }

  static create(props: NarrativeNodeProps): NarrativeNode {
    return new NarrativeNode(
      requireText(props.id, 'Node id'),
      requireText(props.chapterId, 'Node chapterId'),
      props.kind,
      requireText(props.label, 'Node label'),
      requireUnitInterval(props.weight ?? DEFAULT_WEIGHT, 'Node weight'),
    )
  }
}
