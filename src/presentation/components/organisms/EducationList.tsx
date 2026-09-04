import type { Education } from '@domain/profile/Education'
import { EducationItem } from '../molecules/EducationItem'

export function EducationList({ entries }: { entries: readonly Education[] }) {
  return (
    <ul className="mt-14 grid max-w-4xl gap-5 sm:grid-cols-2">
      {entries.map((education) => (
        <EducationItem key={education.id} education={education} />
      ))}
    </ul>
  )
}
