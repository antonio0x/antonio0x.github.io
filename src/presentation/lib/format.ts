import type { Period } from '@domain/profile/Period'
import type { Locale } from '@domain/shared/Locale'

/**
 * Renders a period the way it was written down.
 *
 * A CV line that says "2019 – 2025" must not become "Jan 2019 – Jan 2025":
 * that would be the interface asserting a precision the source never had.
 * `Period.precision` is what makes the distinction possible.
 */
export function formatPeriod(period: Period, locale: Locale, presentLabel: string): string {
  const from = formatBoundary(period.start.year, period.start.month, period.precision, locale)
  const to =
    period.end === null
      ? presentLabel
      : formatBoundary(period.end.year, period.end.month, period.precision, locale)

  return from === to ? from : `${from} — ${to}`
}

function formatBoundary(
  year: number,
  month: number,
  precision: Period['precision'],
  locale: Locale,
): string {
  if (precision === 'year') return String(year)

  const monthName = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  )

  // Some locales append a full stop to abbreviated months; it reads as noise here.
  return `${monthName.replace(/\.$/, '')} ${year}`
}

/** Singular and plural forms for a unit, as the locale needs them. */
export interface UnitLabels {
  readonly one: string
  readonly other: string
}

export interface DurationLabels {
  readonly year: UnitLabels
  readonly month: UnitLabels
}

/**
 * Turns a month count into the coarsest phrasing that is still true.
 *
 * Under a year, months. Over a year, years plus the remainder, with the
 * remainder dropped when it is zero so nobody reads "1 year 0 months".
 *
 * Pluralisation goes through Intl.PluralRules rather than an `n === 1` check:
 * "1 años" is the kind of detail that makes a portfolio look unfinished, and
 * the rule is not the same in every language the site may grow into.
 */
export function formatDuration(
  totalMonths: number,
  locale: Locale,
  labels: DurationLabels,
): string {
  const plural = new Intl.PluralRules(locale)
  const unit = (count: number, forms: UnitLabels) =>
    `${count} ${plural.select(count) === 'one' ? forms.one : forms.other}`

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  if (years === 0) return unit(months, labels.month)
  if (months === 0) return unit(years, labels.year)

  return `${unit(years, labels.year)}, ${unit(months, labels.month)}`
}
