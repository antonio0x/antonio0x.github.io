import { invariant } from '@domain/shared/DomainError'

/**
 * Narrows a raw JSON string against a closed set the domain owns.
 *
 * Content files are hand-edited, so this is the boundary where a typo like
 * "devosp" turns into a loud failure instead of a silently miscategorised
 * node in the graph.
 */
export function oneOf<const T extends readonly string[]>(
  allowed: T,
  value: string,
  label: string,
): T[number] {
  invariant(
    (allowed as readonly string[]).includes(value),
    `${label} must be one of ${allowed.join(', ')} — received "${value}"`,
  )

  return value
}
