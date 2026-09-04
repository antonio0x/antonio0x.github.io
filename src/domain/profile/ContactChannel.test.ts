import { describe, expect, it } from 'vitest'
import { DomainError } from '../shared/DomainError'
import { ContactChannel } from './ContactChannel'

describe('ContactChannel', () => {
  it('builds an email channel', () => {
    const channel = ContactChannel.create({
      kind: 'email',
      label: 'rantonioquin@gmail.com',
      href: 'mailto:rantonioquin@gmail.com',
    })

    expect(channel.kind).toBe('email')
    expect(channel.href).toBe('mailto:rantonioquin@gmail.com')
  })

  it('enforces the scheme each kind requires, so a broken link never ships', () => {
    expect(() =>
      ContactChannel.create({ kind: 'email', label: 'x', href: 'https://example.com' }),
    ).toThrow(DomainError)
    expect(() => ContactChannel.create({ kind: 'phone', label: 'x', href: '+1 555 000 0000' })).toThrow(
      DomainError,
    )
    expect(() => ContactChannel.create({ kind: 'github', label: 'x', href: 'antonio0x' })).toThrow(
      DomainError,
    )
  })

  it('accepts a valid href for every kind', () => {
    expect(() =>
      ContactChannel.create({ kind: 'phone', label: 'x', href: 'tel:+15550000000' }),
    ).not.toThrow()
    expect(() =>
      ContactChannel.create({ kind: 'github', label: 'x', href: 'https://github.com/antonio0x' }),
    ).not.toThrow()
    expect(() =>
      ContactChannel.create({ kind: 'linkedin', label: 'x', href: 'https://linkedin.com/in/x' }),
    ).not.toThrow()
    expect(() =>
      ContactChannel.create({ kind: 'resume', label: 'CV', href: '/AntonioQuintanilla-CV.pdf' }),
    ).not.toThrow()
  })

  it('marks external channels so the view can add rel="noreferrer"', () => {
    expect(
      ContactChannel.create({ kind: 'github', label: 'x', href: 'https://github.com/antonio0x' })
        .isExternal,
    ).toBe(true)
    expect(
      ContactChannel.create({ kind: 'resume', label: 'CV', href: '/cv.pdf' }).isExternal,
    ).toBe(false)
    expect(
      ContactChannel.create({ kind: 'email', label: 'x', href: 'mailto:a@b.c' }).isExternal,
    ).toBe(false)
  })

  it('rejects a blank label or href', () => {
    expect(() => ContactChannel.create({ kind: 'email', label: '', href: 'mailto:a@b.c' })).toThrow(
      DomainError,
    )
    expect(() => ContactChannel.create({ kind: 'email', label: 'x', href: '' })).toThrow(DomainError)
  })
})
