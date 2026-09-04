import type { ContactChannel } from '@domain/profile/ContactChannel'
import type { SpokenLanguage } from '@domain/profile/Profile'
import { ChannelLink } from '../molecules/ChannelLink'
import { useLocale } from '../../i18n/useLocale'

export interface ContactPanelProps {
  channels: readonly ContactChannel[]
  languages: readonly SpokenLanguage[]
}

export function ContactPanel({ channels, languages }: ContactPanelProps) {
  const { t } = useLocale()

  return (
    <div className="mt-14 grid max-w-4xl gap-12 lg:grid-cols-[1.4fr_1fr]">
      <ul className="grid gap-3 sm:grid-cols-2">
        {channels.map((channel) => (
          <ChannelLink key={channel.kind} channel={channel} />
        ))}
      </ul>

      <section aria-label={t.languagesHeading}>
        <h3 className="font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
          {t.languagesHeading}
        </h3>
        <hr className="rule mt-3 mb-4" />

        <dl className="space-y-2 text-sm">
          {languages.map((language) => (
            <div key={language.name} className="flex justify-between gap-4">
              <dt>{language.name}</dt>
              <dd className="text-ink-muted">{language.level}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
