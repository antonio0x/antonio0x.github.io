import { invariant } from '../shared/DomainError'
import { requireText } from '../shared/guards'
import type { Period } from './Period'

export const EDUCATION_STATUSES = ['completed', 'in-progress'] as const

export type EducationStatus = (typeof EDUCATION_STATUSES)[number]

export interface EducationProps {
  readonly id: string
  readonly institution: string
  readonly program: string
  readonly period: Period
  readonly status: EducationStatus
}

export class Education {
  private constructor(
    readonly id: string,
    readonly institution: string,
    readonly program: string,
    readonly period: Period,
    readonly status: EducationStatus,
  ) {
    Object.freeze(this)
  }

  static create(props: EducationProps): Education {
    // Status and period are two ways of saying the same thing, so they must agree.
    // Letting them drift is how a CV ends up claiming a degree finished in the future.
    invariant(
      (props.status === 'in-progress') === props.period.isOngoing,
      `Education "${props.id}" is marked ${props.status} but its period is ${
        props.period.isOngoing ? 'open-ended' : 'closed'
      }`,
    )

    return new Education(
      requireText(props.id, 'Education id'),
      requireText(props.institution, 'Education institution'),
      requireText(props.program, 'Education program'),
      props.period,
      props.status,
    )
  }

  get isOngoing(): boolean {
    return this.period.isOngoing
  }
}
