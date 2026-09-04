import type { Skill, SkillCategory } from '@domain/profile/Skill'
import { SkillChip } from '../molecules/SkillChip'
import { useLocale } from '../../i18n/useLocale'

export interface SkillClustersProps {
  /** Already grouped by the container — the view does not compute, it renders. */
  groups: readonly (readonly [SkillCategory, readonly Skill[]])[]
}

export function SkillClusters({ groups }: SkillClustersProps) {
  const { t } = useLocale()

  return (
    <div className="mt-14 grid gap-10 sm:grid-cols-2">
      {groups.map(([category, skills]) => (
        <section key={category} aria-label={t.skillCategory[category]}>
          <h3 className="label tracking-[0.18em] text-ink-faint uppercase">
            {t.skillCategory[category]}
          </h3>
          <hr className="rule mt-3 mb-4" />

          <ul className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <SkillChip key={skill.id} skill={skill} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
