import type { Certification } from '@domain/profile/Certification'

export function CertificationList({ entries }: { entries: readonly Certification[] }) {
  return (
    <ul className="mt-14 grid max-w-4xl gap-3 sm:grid-cols-2">
      {entries.map((certification) => (
        <li
          key={certification.id}
          className="flex items-baseline justify-between gap-4 rounded-xl border border-line bg-surface/85 px-5 py-4"
        >
          <span>{certification.name}</span>
          {certification.hasIssuer && (
            <span className="shrink-0 font-mono text-xs text-ink-faint">{certification.issuer}</span>
          )}
        </li>
      ))}
    </ul>
  )
}
