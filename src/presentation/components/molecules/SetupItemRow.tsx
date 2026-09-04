import type { SetupItem } from '@domain/profile/SetupItem'
import { SmartLink } from '../atoms/SmartLink'
import { useLocale } from '../../i18n/useLocale'

export interface SetupItemRowProps {
  item: SetupItem
}

/** One piece of the environment, with the reason it was chosen. */
export function SetupItemRow({ item }: SetupItemRowProps) {
  const { t } = useLocale()
  const layer = t.setupLayers[item.category] ?? item.category

  return (
    <li className="grid gap-1 border-l border-line py-3 pl-5 transition-colors duration-300 hover:border-signal-dim sm:grid-cols-[9rem_1fr] sm:gap-6">
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">{layer}</div>

      <div>
        <h3 className="text-base text-ink">
          {item.url === null ? (
            item.name
          ) : (
            <SmartLink
              href={item.url}
              external
              ariaLabel={`${item.name} — ${layer}`}
              className="underline-offset-4 hover:text-signal hover:underline"
            >
              {item.name}
            </SmartLink>
          )}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.note}</p>
      </div>
    </li>
  )
}
