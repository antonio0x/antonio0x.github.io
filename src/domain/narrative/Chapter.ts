import { requireNonNegativeInteger, requireText } from '../shared/guards'

export interface ChapterProps {
  readonly id: string
  /** Position in the story. Must run contiguously from 0 across the journey. */
  readonly index: number
  readonly eyebrow: string
  readonly title: string
  readonly body: string
  /**
   * The node the camera settles on. Null lets the rig frame the whole chapter.
   * Deliberately a node reference and not a camera position: where the camera
   * physically goes is a rendering decision, not a narrative one.
   */
  readonly focusNodeId: string | null
}

/** One beat of the story, and the text that goes with it. */
export class Chapter {
  private constructor(
    readonly id: string,
    readonly index: number,
    readonly eyebrow: string,
    readonly title: string,
    readonly body: string,
    readonly focusNodeId: string | null,
  ) {
    Object.freeze(this)
  }

  static create(props: ChapterProps): Chapter {
    return new Chapter(
      requireText(props.id, 'Chapter id'),
      requireNonNegativeInteger(props.index, 'Chapter index'),
      props.eyebrow,
      requireText(props.title, 'Chapter title'),
      props.body,
      props.focusNodeId,
    )
  }
}
