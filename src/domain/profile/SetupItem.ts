import { invariant } from '../shared/DomainError'
import { requireText } from '../shared/guards'

/**
 * The layers of a configured system, ordered from the machine outwards.
 *
 * The order is the point: a list that reads distro, shell, editor tells the
 * reader how the environment is built up. Sorted alphabetically it would tell
 * them nothing.
 */
export const SETUP_CATEGORIES = [
  'distro',
  'shell',
  'multiplexer',
  'editor',
  'tooling',
  'theme',
] as const

export type SetupCategory = (typeof SETUP_CATEGORIES)[number]

const LAYER_RANK: Readonly<Record<SetupCategory, number>> = Object.fromEntries(
  SETUP_CATEGORIES.map((category, index) => [category, index]),
) as Record<SetupCategory, number>

export interface SetupItemProps {
  readonly id: string
  readonly name: string
  readonly category: SetupCategory
  readonly note: string
  readonly url: string | null
}

/**
 * One piece of the environment the author actually works in.
 *
 * This exists as its own entity rather than as another `Skill` because it
 * answers a different question. A skill says what someone can do; a setup item
 * says what they chose, and why. The note is required for exactly that reason:
 * a bare list of tool names is a screenshot caption, not evidence of judgement.
 */
export class SetupItem {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly category: SetupCategory,
    readonly note: string,
    readonly url: string | null,
  ) {
    Object.freeze(this)
  }

  static create(props: SetupItemProps): SetupItem {
    return new SetupItem(
      requireText(props.id, 'SetupItem id'),
      requireText(props.name, 'SetupItem name'),
      props.category,
      requireText(props.note, 'SetupItem note'),
      props.url === null ? null : requireHttpUrl(props.url, props.id),
    )
  }

  static byLayer(this: void, a: SetupItem, b: SetupItem): number {
    return LAYER_RANK[a.category] - LAYER_RANK[b.category]
  }
}

function requireHttpUrl(value: string, id: string): string {
  const trimmed = requireText(value, 'SetupItem url')
  invariant(
    /^https?:\/\//.test(trimmed),
    `SetupItem "${id}" has a url that will not open in a browser: "${trimmed}"`,
  )
  return trimmed
}
