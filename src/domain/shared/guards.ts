import { invariant } from './DomainError'

/** Asserts a string carries meaning, not just whitespace. */
export function requireText(value: string, label: string): string {
  const trimmed = value.trim()
  invariant(trimmed.length > 0, `${label} must not be blank`)
  return trimmed
}

/** Asserts a number sits inside the inclusive unit interval used by the renderer. */
export function requireUnitInterval(value: number, label: string): number {
  invariant(
    Number.isFinite(value) && value >= 0 && value <= 1,
    `${label} must be between 0 and 1, received ${value}`,
  )
  return value
}

export function requireNonNegativeInteger(value: number, label: string): number {
  invariant(
    Number.isInteger(value) && value >= 0,
    `${label} must be a non-negative integer, received ${value}`,
  )
  return value
}

export function requireUnique<T>(values: readonly T[], keyOf: (value: T) => string, label: string): void {
  const seen = new Set<string>()
  for (const value of values) {
    const key = keyOf(value)
    invariant(!seen.has(key), `${label} must be unique, "${key}" appears more than once`)
    seen.add(key)
  }
}
