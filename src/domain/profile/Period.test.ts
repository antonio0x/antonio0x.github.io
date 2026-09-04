import { describe, expect, it } from 'vitest'
import { DomainError } from '../shared/DomainError'
import { Period } from './Period'

describe('Period', () => {
  describe('parsing', () => {
    it('accepts a full YYYY-MM range', () => {
      const period = Period.create('2019-03', '2025-07')

      expect(period.start).toEqual({ year: 2019, month: 3 })
      expect(period.end).toEqual({ year: 2025, month: 7 })
    })

    it('accepts a bare YYYY and treats it as January', () => {
      const period = Period.create('2019', '2025')

      expect(period.start).toEqual({ year: 2019, month: 1 })
      expect(period.end).toEqual({ year: 2025, month: 1 })
    })

    it('rejects a malformed value', () => {
      expect(() => Period.create('march 2019', null)).toThrow(DomainError)
      expect(() => Period.create('19-03', null)).toThrow(DomainError)
      expect(() => Period.create('', null)).toThrow(DomainError)
    })

    it('rejects a month outside 1-12', () => {
      expect(() => Period.create('2019-13', null)).toThrow(DomainError)
      expect(() => Period.create('2019-00', null)).toThrow(DomainError)
    })
  })

  describe('ordering', () => {
    it('rejects an end that precedes the start', () => {
      expect(() => Period.create('2025-07', '2019-03')).toThrow(DomainError)
      expect(() => Period.create('2019-07', '2019-03')).toThrow(DomainError)
    })

    it('allows a period that starts and ends in the same month', () => {
      expect(() => Period.create('2024-12', '2024-12')).not.toThrow()
    })
  })

  describe('ongoing periods', () => {
    it('is ongoing when no end is given', () => {
      const period = Period.create('2025-08', null)

      expect(period.isOngoing).toBe(true)
      expect(period.end).toBeNull()
    })

    it('is not ongoing when an end is given', () => {
      expect(Period.create('2019-03', '2025-07').isOngoing).toBe(false)
    })
  })

  describe('durationInMonths', () => {
    it('counts both boundary months as elapsed', () => {
      // March 2019 through July 2025 inclusive.
      expect(Period.create('2019-03', '2025-07').durationInMonths()).toBe(77)
    })

    it('reports a single month for a same-month period', () => {
      expect(Period.create('2024-12', '2024-12').durationInMonths()).toBe(1)
    })

    it('measures an ongoing period against the supplied reference date', () => {
      const period = Period.create('2025-08', null)

      expect(period.durationInMonths(new Date('2026-08-31T00:00:00Z'))).toBe(13)
    })
  })

  describe('years', () => {
    it('exposes the calendar span for display', () => {
      expect(Period.create('2019-03', '2025-07').years).toEqual({ from: 2019, to: 2025 })
    })

    it('leaves the closing year open when ongoing', () => {
      expect(Period.create('2025-08', null).years).toEqual({ from: 2025, to: null })
    })
  })

  describe('equality', () => {
    it('compares by value, not by reference', () => {
      expect(Period.create('2019-03', '2025-07').equals(Period.create('2019-03', '2025-07'))).toBe(
        true,
      )
      expect(Period.create('2019-03', '2025-07').equals(Period.create('2019-04', '2025-07'))).toBe(
        false,
      )
      expect(Period.create('2019-03', null).equals(Period.create('2019-03', '2025-07'))).toBe(false)
    })
  })
})

describe('Period precision', () => {
  it('remembers that a bare year was written, so the UI never invents a month', () => {
    expect(Period.create('2019', '2025').precision).toBe('year')
  })

  it('records month precision when both boundaries carry a month', () => {
    expect(Period.create('2024-12', '2025-07').precision).toBe('month')
  })

  it('degrades to year precision when either boundary is vague', () => {
    expect(Period.create('2019', '2025-07').precision).toBe('year')
    expect(Period.create('2019-03', '2025').precision).toBe('year')
  })

  it('takes precision from the start when the period is ongoing', () => {
    expect(Period.create('2025-08', null).precision).toBe('month')
    expect(Period.create('2025', null).precision).toBe('year')
  })
})
