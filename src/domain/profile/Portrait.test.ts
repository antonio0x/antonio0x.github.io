import { describe, expect, it } from 'vitest'
import { DomainError } from '../shared/DomainError'
import { Portrait } from './Portrait'

const valid = {
  src: '/portrait-512.jpg',
  webpSrc: '/portrait-512.webp',
  alt: 'Antonio Quintanilla',
  width: 512,
  height: 512,
}

describe('Portrait', () => {
  it('keeps the sources and description it was given', () => {
    const portrait = Portrait.create(valid)

    expect(portrait.src).toBe('/portrait-512.jpg')
    expect(portrait.webpSrc).toBe('/portrait-512.webp')
    expect(portrait.alt).toBe('Antonio Quintanilla')
  })

  it('treats a missing modern source as acceptable, not as an error', () => {
    // The fallback alone is a complete portrait; webp is an optimisation.
    const portrait = Portrait.create({ ...valid, webpSrc: null })

    expect(portrait.webpSrc).toBeNull()
  })

  it('rejects a blank alt text', () => {
    // A decorative portrait would be marked aria-hidden instead. This one
    // carries the person's name, so an empty alt is a defect, not a choice.
    expect(() => Portrait.create({ ...valid, alt: '   ' })).toThrow(DomainError)
  })

  it('rejects a blank source', () => {
    expect(() => Portrait.create({ ...valid, src: '' })).toThrow(DomainError)
  })

  it.each([
    ['zero width', { width: 0 }],
    ['negative height', { height: -1 }],
    ['fractional width', { width: 512.5 }],
  ])('rejects %s', (_label, overrides) => {
    expect(() => Portrait.create({ ...valid, ...overrides })).toThrow(DomainError)
  })

  it('exposes the aspect ratio so the layout can reserve space before load', () => {
    // Width and height exist to prevent layout shift, which is the only
    // reason the domain carries them at all.
    expect(Portrait.create(valid).aspectRatio).toBeCloseTo(1)
    expect(Portrait.create({ ...valid, width: 800, height: 400 }).aspectRatio).toBeCloseTo(2)
  })
})
