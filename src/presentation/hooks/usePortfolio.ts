import { useEffect, useState } from 'react'
import type { Portfolio } from '@application/use-cases/LoadPortfolio'
import type { Locale } from '@domain/shared/Locale'
import { getContainer } from '@infrastructure/di/container'

export type PortfolioState =
  | { status: 'loading' }
  | { status: 'ready'; portfolio: Portfolio }
  | { status: 'failed'; error: Error }

type Resolved =
  | { locale: Locale; portfolio: Portfolio }
  | { locale: Locale; error: Error }

/**
 * Loads the portfolio for a locale through the composition root.
 *
 * The loading state is *derived* — "we have no result for the locale currently
 * asked for" — rather than written into state at the top of the effect. Setting
 * it there would queue a second render on every locale change and let the old
 * language paint for one frame before the placeholder replaced it.
 *
 * The content is bundled, so this resolves on the first tick, but it still goes
 * through the async port. The day the content moves behind an API, nothing
 * here or below it changes.
 */
export function usePortfolio(locale: Locale): PortfolioState {
  const [resolved, setResolved] = useState<Resolved | null>(null)

  useEffect(() => {
    let active = true

    getContainer()
      .loadPortfolio(locale)
      .then((portfolio) => {
        if (active) setResolved({ locale, portfolio })
      })
      .catch((cause: unknown) => {
        if (active) {
          setResolved({
            locale,
            error: cause instanceof Error ? cause : new Error(String(cause)),
          })
        }
      })

    // Guards against a locale switch resolving out of order.
    return () => {
      active = false
    }
  }, [locale])

  if (resolved === null || resolved.locale !== locale) {
    return { status: 'loading' }
  }

  return 'error' in resolved
    ? { status: 'failed', error: resolved.error }
    : { status: 'ready', portfolio: resolved.portfolio }
}
