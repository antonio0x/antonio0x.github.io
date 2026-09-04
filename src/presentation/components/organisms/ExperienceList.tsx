import type { Experience } from '@domain/profile/Experience'
import type { Skill } from '@domain/profile/Skill'
import { ExperienceItem } from '../molecules/ExperienceItem'

export interface ExperienceListProps {
  entries: readonly { experience: Experience; skills: readonly Skill[] }[]
}

export function ExperienceList({ entries }: ExperienceListProps) {
  return (
    <ol className="mt-14 max-w-3xl">
      {entries.map(({ experience, skills }) => (
        <ExperienceItem key={experience.id} experience={experience} skills={skills} />
      ))}
    </ol>
  )
}
