import { describe, expect, it } from 'vitest'
import { DomainError, invariant } from './DomainError'

describe('DomainError', () => {
  it('is an Error with a stable name so callers can discriminate it', () => {
    const error = new DomainError('broken rule')

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('DomainError')
    expect(error.message).toBe('broken rule')
  })
})

describe('invariant', () => {
  it('does nothing when the condition holds', () => {
    expect(() => invariant(true, 'never thrown')).not.toThrow()
  })

  it('throws a DomainError carrying the rule that was broken', () => {
    expect(() => invariant(false, 'a chapter needs at least one node')).toThrow(DomainError)
    expect(() => invariant(false, 'a chapter needs at least one node')).toThrow(
      'a chapter needs at least one node',
    )
  })

  it('narrows the type of the checked value', () => {
    const readValue = (): string | null => 'present'
    const value = readValue()

    invariant(value !== null, 'value is required')

    // Type-level assertion: this line only compiles if `value` is narrowed.
    expect(value.length).toBe(7)
  })
})
