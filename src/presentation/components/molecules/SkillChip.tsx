import type { Skill } from '@domain/profile/Skill'
import { nodeIds } from '@domain/narrative/nodeIds'
import { useNodeLink } from '../../hooks/useNodeLink'
import { useLocale } from '../../i18n/useLocale'

/**
 * Opacity and border weight carry proficiency instead of a percentage bar.
 * Nobody can defend "React 82%", and every reader has learned to ignore it.
 */
const TONE_BY_PROFICIENCY = {
  core: 'border-signal-dim bg-signal/10 text-ink',
  working: 'border-line-bright bg-raised text-ink',
  familiar: 'border-line bg-transparent text-ink-muted',
} as const

export function SkillChip({ skill }: { skill: Skill }) {
  const { t } = useLocale()
  const link = useNodeLink(nodeIds.skill(skill.id))

  return (
    <li
      {...link}
      className={`inline-flex items-baseline gap-2 rounded-lg border px-3 py-1.5 text-sm ${TONE_BY_PROFICIENCY[skill.proficiency]}`}
    >
      <span>{skill.name}</span>
      <span className="label text-[0.65rem] text-ink-faint">
        {t.proficiency[skill.proficiency]}
      </span>
    </li>
  )
}
