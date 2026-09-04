import { getContainer } from '@infrastructure/di/container'
import { useLocale } from '../i18n/useLocale'
import { usePortfolio } from '../hooks/usePortfolio'
import { useQualityTier } from '../hooks/useQualityTier'
import { PortfolioView } from './PortfolioView'

/**
 * Connects the load use case to the view and handles the states it can be in.
 *
 * The failure branch matters more than it looks: the content files are
 * validated by the domain at construction time, so a bad edit surfaces as a
 * readable message with a way to reach the author, never as a blank page.
 */
export function PortfolioContainer() {
  const { locale } = useLocale()
  const state = usePortfolio(locale)

  // Decided once, up here, so the whole tree agrees on the rendering budget.
  useQualityTier()

  if (state.status === 'loading') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[100svh] items-center justify-center font-mono text-xs tracking-[0.2em] text-ink-faint"
      >
        <span className="sr-only">Loading</span>
        <span aria-hidden="true">· · ·</span>
      </div>
    )
  }

  if (state.status === 'failed') {
    return (
      <div className="mx-auto flex min-h-[100svh] max-w-xl flex-col justify-center gap-4 px-6">
        <h1 className="text-2xl">Antonio Quintanilla</h1>
        <p className="text-ink-muted">
          Something went wrong rendering this portfolio. You can still reach me at{' '}
          <a href="mailto:rantonioquin@gmail.com" className="text-signal underline">
            rantonioquin@gmail.com
          </a>{' '}
          or on{' '}
          <a
            href="https://github.com/antonio0x"
            target="_blank"
            rel="noreferrer noopener"
            className="text-signal underline"
          >
            GitHub
          </a>
          .
        </p>
        <pre className="overflow-x-auto rounded-lg border border-line bg-surface p-4 text-xs text-ink-faint">
          {state.error.message}
        </pre>
      </div>
    )
  }

  return <PortfolioView portfolio={state.portfolio} layout={getContainer().layout} />
}
