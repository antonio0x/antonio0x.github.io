import type { SetupItem } from '@domain/profile/SetupItem'
import { SetupItemRow } from '../molecules/SetupItemRow'

export interface SetupListProps {
  items: readonly SetupItem[]
}

/**
 * The configured environment, read from the machine outwards.
 *
 * The order is the argument. Distro, then shell, then the tools running inside
 * it shows a system that was built up deliberately; the same names sorted
 * alphabetically would just be a list of logos.
 */
export function SetupList({ items }: SetupListProps) {
  return (
    <ul className="mt-14 space-y-1">
      {items.map((item) => (
        <SetupItemRow key={item.id} item={item} />
      ))}
    </ul>
  )
}
