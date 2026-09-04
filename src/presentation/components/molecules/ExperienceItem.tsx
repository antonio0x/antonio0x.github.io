import type { Experience } from '@domain/profile/Experience'
import type { Skill } from '@domain/profile/Skill'
import { Tag } from '../atoms/Tag'
import { formatPeriod } from '../../lib/format'
import { useLocale } from '../../i18n/useLocale'

export interface ExperienceItemProps {
  experience: Experience
  /** Resolved by the container: presentational components do not look things up. */
  skills: readonly Skill[]
}

export function ExperienceItem({ experience, skills }: ExperienceItemProps) {
  const { locale, t } = useLocale()

  return (
    <li className="relative border-l border-line pl-6 pb-10 last:pb-0">
      <span
        aria-hidden="true"
        className="absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full border border-signal bg-void"
      />

      <p className="font-mono text-xs tracking-wide text-signal">
        {formatPeriod(experience.period, locale, t.present)}
      </p>

      <h3 className="mt-1 text-xl">{experience.organization}</h3>
      <p className="text-ink-muted">{experience.role}</p>

      <div className="mt-2">
        <Tag>{t.workMode[experience.mode]}</Tag>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-ink-muted">
        {experience.highlights.map((highlight) => (
          <li key={highlight} className="flex gap-2">
            <span aria-hidden="true" className="text-signal-deep">
              ▸
            </span>
            <span>{highlight}</span>
          </li>
        ))}
      </ul>

      {skills.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <li key={skill.id}>
              <Tag tone="signal">{skill.name}</Tag>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
