import { requireText } from '../shared/guards'

export const SKILL_CATEGORIES = [
  'language',
  'database',
  'framework',
  'devops',
  'tool',
  'methodology',
] as const

export type SkillCategory = (typeof SKILL_CATEGORIES)[number]

/**
 * How deeply the skill is actually held.
 *
 * Three honest levels beat a fake percentage bar. Nobody knows what "React 82%"
 * means, and every recruiter has learned to ignore it.
 */
export const PROFICIENCIES = ['core', 'working', 'familiar'] as const

export type Proficiency = (typeof PROFICIENCIES)[number]

const WEIGHT_BY_PROFICIENCY: Readonly<Record<Proficiency, number>> = {
  core: 1,
  working: 0.7,
  familiar: 0.45,
}

const RANK_BY_PROFICIENCY: Readonly<Record<Proficiency, number>> = {
  core: 0,
  working: 1,
  familiar: 2,
}

export interface SkillProps {
  readonly id: string
  readonly name: string
  readonly category: SkillCategory
  readonly proficiency: Proficiency
}

export class Skill {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly category: SkillCategory,
    readonly proficiency: Proficiency,
  ) {
    Object.freeze(this)
  }

  static create(props: SkillProps): Skill {
    return new Skill(
      requireText(props.id, 'Skill id'),
      requireText(props.name, 'Skill name'),
      props.category,
      props.proficiency,
    )
  }

  /** Visual prominence in the network, derived from proficiency rather than authored twice. */
  get weight(): number {
    return WEIGHT_BY_PROFICIENCY[this.proficiency]
  }

  static byProficiency(this: void, a: Skill, b: Skill): number {
    return RANK_BY_PROFICIENCY[a.proficiency] - RANK_BY_PROFICIENCY[b.proficiency]
  }
}
