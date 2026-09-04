import type { Certification } from '@domain/profile/Certification'
import { nodeIds } from '@domain/narrative/nodeIds'
import { useNodeLink } from '../../hooks/useNodeLink'

/**
 * Split out of CertificationList so it can hold the hook that ties it to its
 * node. A row rendered inside a map cannot call one; a component can.
 */
export function CertificationItem({ certification }: { certification: Certification }) {
  const link = useNodeLink(nodeIds.certification(certification.id))

  return (
    <li
      {...link}
      className="flex items-baseline justify-between gap-4 rounded-xl border border-line bg-surface/85 px-5 py-4"
    >
      <span>{certification.name}</span>
      {certification.hasIssuer && (
        <span className="shrink-0 label text-ink-faint">{certification.issuer}</span>
      )}
    </li>
  )
}
