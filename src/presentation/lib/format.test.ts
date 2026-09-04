import { describe, expect, it } from 'vitest'
import { Period } from '@domain/profile/Period'
import { formatDuration, formatPeriod, type DurationLabels } from './format'

describe('formatPeriod', () => {
  it('prints years only when the source only gave years', () => {
    expect(formatPeriod(Period.create('2019', '2025'), 'es', 'Actualidad')).toBe('2019 — 2025')
  })

  it('prints months when the source gave months', () => {
    expect(formatPeriod(Period.create('2024-12', '2025-07'), 'en', 'Present')).toBe(
      'Dec 2024 — Jul 2025',
    )
  })

  it('uses the present label for an ongoing period', () => {
    expect(formatPeriod(Period.create('2025-08', null), 'en', 'Present')).toBe('Aug 2025 — Present')
  })

  it('collapses a single-year period instead of repeating it', () => {
    expect(formatPeriod(Period.create('2021', '2021'), 'es', 'Actualidad')).toBe('2021')
  })

  it('localises month names', () => {
    const rendered = formatPeriod(Period.create('2024-12', '2025-01'), 'es', 'Actualidad')

    expect(rendered).not.toMatch(/Dec/)
    expect(rendered.toLowerCase()).toContain('dic')
  })
})

describe('formatDuration', () => {
  const es: DurationLabels = {
    year: { one: 'año', other: 'años' },
    month: { one: 'mes', other: 'meses' },
  }
  const en: DurationLabels = {
    year: { one: 'year', other: 'years' },
    month: { one: 'month', other: 'months' },
  }

  it('reports months alone under a year', () => {
    expect(formatDuration(7, 'es', es)).toBe('7 meses')
  })

  it('drops a zero remainder', () => {
    expect(formatDuration(24, 'es', es)).toBe('2 años')
  })

  it('uses the singular form for exactly one unit', () => {
    expect(formatDuration(1, 'es', es)).toBe('1 mes')
    expect(formatDuration(12, 'es', es)).toBe('1 año')
    expect(formatDuration(13, 'es', es)).toBe('1 año, 1 mes')
    expect(formatDuration(13, 'en', en)).toBe('1 year, 1 month')
  })

  it('reports both parts when both are non-zero', () => {
    expect(formatDuration(19, 'es', es)).toBe('1 año, 7 meses')
  })

  it('handles zero without producing an empty string', () => {
    expect(formatDuration(0, 'es', es)).toBe('0 meses')
  })
})
