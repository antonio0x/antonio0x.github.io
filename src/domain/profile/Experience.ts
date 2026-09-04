import { requireText } from '../shared/guards'
import type { Period } from './Period'

export const WORK_MODES = ['onsite', 'remote', 'hybrid'] as const

export type WorkMode = (typeof WORK_MODES)[number]

export interface ExperienceProps {
  readonly id: string
  readonly organization: string
  readonly role: string
  readonly period: Period
  readonly mode: WorkMode
  readonly highlights: readonly string[]
  /** Skills exercised in this role. Validated against the profile's skill set. */
  readonly skillIds: readonly string[]
}

export class Experience {
  private constructor(
    readonly id: string,
    readonly organization: string,
    readonly role: string,
    readonly period: Period,
    readonly mode: WorkMode,
    readonly highlights: readonly string[],
    readonly skillIds: readonly string[],
  ) {
    Object.freeze(this)
  }

  static create(props: ExperienceProps): Experience {
    return new Experience(
      requireText(props.id, 'Experience id'),
      requireText(props.organization, 'Experience organization'),
      requireText(props.role, 'Experience role'),
      props.period,
      props.mode,
      Object.freeze([...props.highlights]),
      Object.freeze([...props.skillIds]),
    )
  }

  /** Most recent first. */
  static byRecency(this: void, a: Experience, b: Experience): number {
    const aStart = a.period.start
    const bStart = b.period.start
    return bStart.year * 12 + bStart.month - (aStart.year * 12 + aStart.month)
  }
}
