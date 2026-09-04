import { useRef } from 'react'
import type { Portfolio } from '@application/use-cases/LoadPortfolio'
import type { GraphLayoutService } from '@domain/ports/GraphLayoutService'
import { ChapterSection } from '../components/organisms/ChapterSection'
import { SiteFooter } from '../components/organisms/SiteFooter'
import { SiteHeader } from '../components/organisms/SiteHeader'
import { useScrollDirector } from '../hooks/useScrollDirector'
import { useLocale } from '../i18n/useLocale'
import { SceneLayer } from '../scene/SceneLayer'
import { ChapterContent } from './ChapterContent'

export interface PortfolioViewProps {
  portfolio: Portfolio
  layout: GraphLayoutService
}

/**
 * The whole document.
 *
 * Two layers, in this order for a reason. The semantic HTML is the site: real
 * sections, real headings, real links, everything a crawler, a screen reader
 * or a WebGL-less device needs. The network is painted behind it and can fail
 * to load entirely without costing the visitor a single word.
 */
export function PortfolioView({ portfolio, layout }: PortfolioViewProps) {
  const { locale, t, toggleLocale } = useLocale()
  const mainRef = useRef<HTMLElement>(null)
  const { profile, journey } = portfolio

  // Changing language rewrites every section, so the trigger positions have to
  // be measured again against the new layout.
  useScrollDirector(mainRef, `${locale}:${String(journey.chapterCount)}`)

  return (
    <>
      <SceneLayer journey={journey} layout={layout} />

      <div className="relative z-10">
        <a href="#main" className="skip-link">
          {t.skipToContent}
        </a>

        <SiteHeader
          displayName={profile.displayName}
          headline={profile.headline}
          locale={locale}
          onToggleLocale={toggleLocale}
        />

        <main id="main" ref={mainRef}>
          {journey.chapters.map((chapter) => (
            <ChapterSection
              key={chapter.id}
              chapter={chapter}
              variant={chapter.index === 0 ? 'hero' : 'standard'}
            >
              <ChapterContent chapter={chapter} portfolio={portfolio} />
            </ChapterSection>
          ))}
        </main>

        <SiteFooter fullName={profile.fullName} />
      </div>
    </>
  )
}
