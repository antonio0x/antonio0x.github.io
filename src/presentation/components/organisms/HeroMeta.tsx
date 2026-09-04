import type { Portrait } from '@domain/profile/Portrait'
import { Icon } from '../atoms/Icon'
import { ProfilePortrait } from '../atoms/ProfilePortrait'
import { useLocale } from '../../i18n/useLocale'

export interface HeroMetaProps {
  location: string
  headline: string
  experience: string
  /** Optional: the intro still reads correctly without a photograph. */
  portrait: Portrait | null
}

/** The three facts worth knowing before scrolling any further. */
export function HeroMeta({ location, headline, experience, portrait }: HeroMetaProps) {
  const { t } = useLocale()

  return (
    <>
      {portrait !== null && (
        <div className="mt-10">
          <ProfilePortrait portrait={portrait} />
        </div>
      )}

      <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 text-sm text-ink-faint">
        <div>
          <dt className="sr-only">{t.siteRole}</dt>
          <dd className="text-ink-muted">{headline}</dd>
        </div>
        <div>
          <dt className="sr-only">{t.experienceLabel}</dt>
          <dd className="text-ink-muted">
            <span className="data">{experience}</span> {t.experienceLabel}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Location</dt>
          <dd className="text-ink-muted">{location}</dd>
        </div>
      </dl>

      <p aria-hidden="true" className="mt-16 label flex items-center gap-2 tracking-[0.2em] text-signal">
        <Icon name="arrowDown" size={14} className="shrink-0" />
        {t.scrollHint}
      </p>
    </>
  )
}
