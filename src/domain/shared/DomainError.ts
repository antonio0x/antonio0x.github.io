/**
 * Raised when a domain rule is violated.
 *
 * Distinct from a generic Error so adapters can tell a broken business rule
 * apart from an infrastructure failure and react differently.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
  }
}

/**
 * Guards a domain invariant.
 *
 * Declared as a function statement rather than an arrow constant because
 * TypeScript only applies assertion signatures to explicitly declared targets.
 */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new DomainError(message)
  }
}
