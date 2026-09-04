import { describe, expect, it } from 'vitest'
import { clamp01, damp, ease, revealAmount } from './reveal'

describe('clamp01', () => {
  it('keeps values inside the unit interval', () => {
    expect(clamp01(-3)).toBe(0)
    expect(clamp01(0.4)).toBe(0.4)
    expect(clamp01(7)).toBe(1)
  })

  it('treats NaN as zero rather than propagating it into a matrix', () => {
    expect(clamp01(Number.NaN)).toBe(0)
    expect(clamp01(Number.POSITIVE_INFINITY)).toBe(0)
  })
})

describe('revealAmount', () => {
  const COUNT = 8

  it('leaves a late chapter hidden at the start of the story', () => {
    expect(revealAmount(6, COUNT, 0)).toBe(0)
  })

  it('has the first chapter fully revealed immediately', () => {
    expect(revealAmount(0, COUNT, 0)).toBe(1)
  })

  it('reveals a chapter before its text is centred', () => {
    const chapterCentre = (3 + 0.5) / COUNT

    expect(revealAmount(3, COUNT, chapterCentre)).toBe(1)
  })

  it('completes a chapter as its section starts entering the viewport', () => {
    expect(revealAmount(3, COUNT, 3 / COUNT)).toBe(1)
  })

  it('has begun but not finished just before a chapter arrives', () => {
    const justBefore = 3 / COUNT - 0.5 / COUNT
    const amount = revealAmount(3, COUNT, justBefore)

    expect(amount).toBeGreaterThan(0)
    expect(amount).toBeLessThan(1)
  })

  it('rises monotonically as the story advances', () => {
    const samples = [0.3, 0.35, 0.4, 0.45, 0.5].map((p) => revealAmount(4, COUNT, p))

    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i]!).toBeGreaterThanOrEqual(samples[i - 1]!)
    }
  })

  it('stays revealed once the story has moved past', () => {
    expect(revealAmount(2, COUNT, 1)).toBe(1)
  })

  it('never returns a value outside 0..1', () => {
    for (let chapter = 0; chapter < COUNT; chapter += 1) {
      for (let step = -5; step <= 15; step += 1) {
        const amount = revealAmount(chapter, COUNT, step / 10)
        expect(amount).toBeGreaterThanOrEqual(0)
        expect(amount).toBeLessThanOrEqual(1)
      }
    }
  })

  it('survives an empty journey without dividing by zero', () => {
    expect(revealAmount(0, 0, 0.5)).toBe(0)
  })
})

describe('ease', () => {
  it('pins both ends', () => {
    expect(ease(0)).toBe(0)
    expect(ease(1)).toBe(1)
  })

  it('passes through the midpoint', () => {
    expect(ease(0.5)).toBeCloseTo(0.5)
  })

  it('clamps out-of-range input', () => {
    expect(ease(-2)).toBe(0)
    expect(ease(4)).toBe(1)
  })
})

describe('damp', () => {
  it('moves towards the target without overshooting', () => {
    const next = damp(0, 10, 5, 1 / 60)

    expect(next).toBeGreaterThan(0)
    expect(next).toBeLessThan(10)
  })

  it('lands on the same place regardless of frame rate', () => {
    // One second of damping, taken in 60 steps or in 120.
    let at60 = 0
    for (let i = 0; i < 60; i += 1) at60 = damp(at60, 10, 4, 1 / 60)

    let at120 = 0
    for (let i = 0; i < 120; i += 1) at120 = damp(at120, 10, 4, 1 / 120)

    expect(at60).toBeCloseTo(at120, 5)
  })

  it('does nothing when already at the target', () => {
    expect(damp(3, 3, 6, 0.016)).toBeCloseTo(3)
  })
})
