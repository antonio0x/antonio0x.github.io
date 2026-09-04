import { invariant } from '../shared/DomainError'
import { requireText } from '../shared/guards'

export interface PortraitProps {
  /** The source every browser can decode. */
  readonly src: string
  /** A smaller modern encoding, when one exists. */
  readonly webpSrc: string | null
  readonly alt: string
  readonly width: number
  readonly height: number
}

function requirePositiveInteger(value: number, label: string): number {
  invariant(
    Number.isInteger(value) && value > 0,
    `${label} must be a positive integer, received ${value}`,
  )
  return value
}

/**
 * The photograph of the person, as the domain understands it.
 *
 * Intrinsic dimensions live here rather than in the component because they are
 * not styling: without them the browser cannot reserve the space, and the text
 * beneath the portrait jumps when the image finally arrives. Carrying them as
 * data means the layout cannot forget them.
 *
 * The modern encoding is explicit rather than derived from `src`. Guessing a
 * `.webp` sibling would produce a silent 404 the day the asset is renamed.
 */
export class Portrait {
  private constructor(
    readonly src: string,
    readonly webpSrc: string | null,
    readonly alt: string,
    readonly width: number,
    readonly height: number,
  ) {
    Object.freeze(this)
  }

  static create(props: PortraitProps): Portrait {
    return new Portrait(
      requireText(props.src, 'Portrait src'),
      props.webpSrc === null ? null : requireText(props.webpSrc, 'Portrait webpSrc'),
      // The portrait carries the person's name, so it is content, not decoration.
      requireText(props.alt, 'Portrait alt'),
      requirePositiveInteger(props.width, 'Portrait width'),
      requirePositiveInteger(props.height, 'Portrait height'),
    )
  }

  get aspectRatio(): number {
    return this.width / this.height
  }
}
