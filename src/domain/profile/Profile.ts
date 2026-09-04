import { invariant } from '../shared/DomainError'
import { requireText, requireUnique } from '../shared/guards'
import type { Certification } from './Certification'
import type { ContactChannel } from './ContactChannel'
import type { Education } from './Education'
import { Experience } from './Experience'
import type { Portrait } from './Portrait'
import { SetupItem } from './SetupItem'
import type { Skill, SkillCategory } from './Skill'

export interface SpokenLanguage {
  readonly name: string
  readonly level: string
}

export interface ProfileProps {
  readonly fullName: string
  readonly displayName: string
  readonly headline: string
  readonly location: string
  readonly summary: string
  readonly skills: readonly Skill[]
  readonly experiences: readonly Experience[]
  readonly education: readonly Education[]
  readonly certifications: readonly Certification[]
  readonly channels: readonly ContactChannel[]
  readonly languages: readonly SpokenLanguage[]
  /** Optional: a profile is complete without a photograph. */
  readonly portrait?: Portrait | null
  /** Optional: not everyone shapes their environment on purpose. */
  readonly setup?: readonly SetupItem[]
}

interface MonthRange {
  start: number
  end: number
}

function toMonthRange(experience: Experience, now: Date): MonthRange {
  const { start } = experience.period
  const end = experience.period.end ?? {
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
  }

  return { start: start.year * 12 + start.month, end: end.year * 12 + end.month }
}

/**
 * Everything the portfolio knows about the person.
 *
 * Aggregate root over the CV. Its job beyond holding data is to guarantee the
 * pieces refer to each other consistently — an experience cannot cite a skill
 * the profile never declares, because that would render as a dangling edge in
 * the network with nothing on the other end.
 */
export class Profile {
  private readonly skillIndex: ReadonlyMap<string, Skill>

  private constructor(
    readonly fullName: string,
    readonly displayName: string,
    readonly headline: string,
    readonly location: string,
    readonly summary: string,
    readonly skills: readonly Skill[],
    readonly experiences: readonly Experience[],
    readonly education: readonly Education[],
    readonly certifications: readonly Certification[],
    readonly channels: readonly ContactChannel[],
    readonly languages: readonly SpokenLanguage[],
    readonly portrait: Portrait | null,
    readonly setup: readonly SetupItem[],
  ) {
    this.skillIndex = new Map(skills.map((skill) => [skill.id, skill]))
    Object.freeze(this)
  }

  static create(props: ProfileProps): Profile {
    requireUnique(props.skills, (skill) => skill.id, 'Skill ids')
    requireUnique(props.experiences, (experience) => experience.id, 'Experience ids')
    requireUnique(props.education, (education) => education.id, 'Education ids')
    requireUnique(props.setup ?? [], (item) => item.id, 'Setup item ids')

    invariant(
      props.channels.length > 0,
      'A profile needs at least one contact channel, otherwise the portfolio has no call to action',
    )

    const skillIds = new Set(props.skills.map((skill) => skill.id))
    for (const experience of props.experiences) {
      for (const skillId of experience.skillIds) {
        invariant(
          skillIds.has(skillId),
          `Experience "${experience.id}" cites unknown skill "${skillId}"`,
        )
      }
    }

    return new Profile(
      requireText(props.fullName, 'Profile fullName'),
      requireText(props.displayName, 'Profile displayName'),
      requireText(props.headline, 'Profile headline'),
      requireText(props.location, 'Profile location'),
      props.summary,
      Object.freeze([...props.skills]),
      Object.freeze([...props.experiences].sort(Experience.byRecency)),
      Object.freeze([...props.education]),
      Object.freeze([...props.certifications]),
      Object.freeze([...props.channels]),
      Object.freeze([...props.languages]),
      props.portrait ?? null,
      // Authored in whatever order was convenient; read from the machine outwards.
      Object.freeze([...(props.setup ?? [])].sort(SetupItem.byLayer)),
    )
  }

  skillById(id: string): Skill | null {
    return this.skillIndex.get(id) ?? null
  }

  skillsByCategory(): ReadonlyMap<SkillCategory, readonly Skill[]> {
    const grouped = new Map<SkillCategory, Skill[]>()

    for (const skill of this.skills) {
      const bucket = grouped.get(skill.category)
      if (bucket === undefined) {
        grouped.set(skill.category, [skill])
      } else {
        bucket.push(skill)
      }
    }

    return grouped
  }

  channelOfKind(kind: ContactChannel['kind']): ContactChannel | null {
    return this.channels.find((channel) => channel.kind === kind) ?? null
  }

  /**
   * Total months of professional work, merging overlapping roles.
   *
   * Two jobs held at the same time are one stretch of experience, not two.
   * Summing each role independently is the classic way a CV accidentally
   * inflates itself.
   */
  totalExperienceMonths(now: Date = new Date()): number {
    const ranges = this.experiences
      .map((experience) => toMonthRange(experience, now))
      .sort((a, b) => a.start - b.start)

    let total = 0
    let current: MonthRange | null = null

    for (const range of ranges) {
      if (current === null) {
        current = { ...range }
        continue
      }

      if (range.start <= current.end + 1) {
        current.end = Math.max(current.end, range.end)
      } else {
        total += current.end - current.start + 1
        current = { ...range }
      }
    }

    return current === null ? 0 : total + (current.end - current.start + 1)
  }
}
