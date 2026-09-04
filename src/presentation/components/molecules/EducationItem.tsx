import type { Education } from '@domain/profile/Education'
import { Tag } from '../atoms/Tag'
import { formatPeriod } from '../../lib/format'
import { useLocale } from '../../i18n/useLocale'

export function EducationItem({ education }: { education: Education }) {
  const { locale, t } = useLocale()

  return (
    <li className="rounded-xl border border-line bg-surface/85 p-5">
      <p className="data text-signal">
        {formatPeriod(education.period, locale, t.present)}
      </p>

      <h3 className="mt-1.5 text-lg leading-snug">{education.program}</h3>
      <p className="mt-1 text-sm text-ink-muted">{education.institution}</p>

      {education.isOngoing && (
        <div className="mt-3">
          <Tag tone="ember">{t.inProgress}</Tag>
        </div>
      )}
    </li>
  )
}
