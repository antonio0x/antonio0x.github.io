import type { Locale } from '@domain/shared/Locale'
import { useLocale } from '../../i18n/useLocale'

export interface SiteHeaderProps {
  displayName: string
  headline: string
  onToggleLocale: () => void
  locale: Locale
}

export function SiteHeader({ displayName, headline, onToggleLocale, locale }: SiteHeaderProps) {
  const { t } = useLocale()

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line/60 bg-void/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3 sm:px-10 lg:px-16">
        <a href="#intro" className="group flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full bg-signal shadow-[0_0_12px] shadow-signal"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{displayName}</span>
            <span className="hidden truncate text-xs text-ink-faint sm:block">{headline}</span>
          </span>
        </a>

        <button
          type="button"
          onClick={onToggleLocale}
          aria-label={t.localeSwitchLabel}
          lang={locale === 'es' ? 'en' : 'es'}
          className="shrink-0 rounded-lg border border-line px-3 py-1.5 font-mono text-xs tracking-wide text-ink-muted transition-colors duration-200 hover:border-signal-dim hover:text-signal"
        >
          {t.switchTo}
        </button>
      </div>
    </header>
  )
}
