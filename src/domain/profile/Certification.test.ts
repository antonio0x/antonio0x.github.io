import { describe, expect, it } from 'vitest'
import { Certification } from './Certification'
import { DomainError } from '../shared/DomainError'

describe('Certification', () => {
  it('records the issuer when one is known', () => {
    const certification = Certification.create({ id: 'git', name: 'Git + GitHub', issuer: 'Udemy' })

    expect(certification.issuer).toBe('Udemy')
    expect(certification.hasIssuer).toBe(true)
  })

  it('accepts a missing issuer instead of forcing one to be invented', () => {
    const certification = Certification.create({
      id: 'linux',
      name: 'Introducción a Linux',
      issuer: null,
    })

    expect(certification.issuer).toBeNull()
    expect(certification.hasIssuer).toBe(false)
  })

  it('still rejects a blank name', () => {
    expect(() => Certification.create({ id: 'x', name: '  ', issuer: null })).toThrow(DomainError)
  })

  it('treats an empty issuer string as no issuer rather than a blank line in the UI', () => {
    expect(Certification.create({ id: 'x', name: 'Y', issuer: '   ' }).issuer).toBeNull()
  })
})
