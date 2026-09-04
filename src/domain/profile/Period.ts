import { invariant } from '../shared/DomainError'

export interface YearMonth {
  readonly year: number
  readonly month: number
}

export interface YearSpan {
  readonly from: number
  readonly to: number | null
}

/** `YYYY` or `YYYY-MM`. */
export type PeriodBoundary = string

const BOUNDARY_PATTERN = /^(\d{4})(?:-(\d{2}))?$/

/** Whether a boundary was authored as a year or narrowed to a month. */
export type PeriodPrecision = 'year' | 'month'

function precisionOf(raw: PeriodBoundary): PeriodPrecision {
  return BOUNDARY_PATTERN.exec(raw)?.[2] === undefined ? 'year' : 'month'
}

function parseBoundary(raw: PeriodBoundary, label: string): YearMonth {
  const match = BOUNDARY_PATTERN.exec(raw)
  invariant(match !== null, `${label} must be formatted as YYYY or YYYY-MM, received "${raw}"`)

  const year = Number(match[1])
  const month = match[2] === undefined ? 1 : Number(match[2])
  invariant(month >= 1 && month <= 12, `${label} month must be between 1 and 12, received ${month}`)

  return { year, month }
}

function toAbsoluteMonths({ year, month }: YearMonth): number {
  return year * 12 + month
}

function fromDate(date: Date): YearMonth {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 }
}

/**
 * A closed or open-ended span of calendar months.
 *
 * Value object: immutable, compared by value, and impossible to construct in
 * an invalid state. A period that ends before it starts is not a bug to catch
 * downstream — it simply cannot exist.
 */
export class Period {
  private constructor(
    readonly start: YearMonth,
    readonly end: YearMonth | null,
    /**
     * How the period was written down.
     *
     * "2019" and "2019-01" parse to the same instant but must not render the
     * same way: printing "Jan 2019" for a CV line that only ever said 2019
     * invents a precision the source never had.
     */
    readonly precision: PeriodPrecision,
  ) {
    Object.freeze(this)
  }

  static create(start: PeriodBoundary, end: PeriodBoundary | null): Period {
    const parsedStart = parseBoundary(start, 'Period start')
    if (end === null) {
      return new Period(parsedStart, null, precisionOf(start))
    }

    const parsedEnd = parseBoundary(end, 'Period end')
    invariant(
      toAbsoluteMonths(parsedEnd) >= toAbsoluteMonths(parsedStart),
      `Period end (${end}) cannot precede its start (${start})`,
    )

    // A range is only as precise as its vaguest end.
    const precision: PeriodPrecision =
      precisionOf(start) === 'month' && precisionOf(end) === 'month' ? 'month' : 'year'

    return new Period(parsedStart, parsedEnd, precision)
  }

  get isOngoing(): boolean {
    return this.end === null
  }

  get years(): YearSpan {
    return { from: this.start.year, to: this.end?.year ?? null }
  }

  /** Inclusive of both boundary months: a period within one month lasts 1 month. */
  durationInMonths(now: Date = new Date()): number {
    const end = this.end ?? fromDate(now)
    return toAbsoluteMonths(end) - toAbsoluteMonths(this.start) + 1
  }

  equals(other: Period): boolean {
    return (
      this.start.year === other.start.year &&
      this.start.month === other.start.month &&
      this.end?.year === other.end?.year &&
      this.end?.month === other.end?.month
    )
  }
}
