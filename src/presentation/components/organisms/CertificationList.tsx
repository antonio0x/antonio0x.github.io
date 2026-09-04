import type { Certification } from '@domain/profile/Certification'
import { CertificationItem } from '../molecules/CertificationItem'

export function CertificationList({ entries }: { entries: readonly Certification[] }) {
  return (
    <ul className="mt-14 grid max-w-4xl gap-3 sm:grid-cols-2">
      {entries.map((certification) => (
        <CertificationItem key={certification.id} certification={certification} />
      ))}
    </ul>
  )
}
