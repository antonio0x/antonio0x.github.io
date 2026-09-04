import type { ReactNode } from 'react'
import { useLocale } from '../../i18n/useLocale'

export interface SmartLinkProps {
  href: string
  external: boolean
  children: ReactNode
  className?: string
  ariaLabel?: string
}

/**
 * A link that knows whether it leaves the site.
 *
 * External links get `rel="noreferrer noopener"` automatically rather than
 * relying on every call site to remember, and screen readers are told the
 * destination opens in a new tab — in the language the visitor chose.
 */
export function SmartLink({ href, external, children, className, ariaLabel }: SmartLinkProps) {
  const { t } = useLocale()

  const externalProps = external
    ? ({ target: '_blank', rel: 'noreferrer noopener' } as const)
    : ({} as const)

  return (
    <a href={href} aria-label={ariaLabel} className={className} {...externalProps}>
      {children}
      {external && <span className="sr-only"> {t.opensInNewTab}</span>}
    </a>
  )
}
