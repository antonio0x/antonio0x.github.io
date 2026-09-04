import { createContext } from 'react'
import type { Locale } from '@domain/shared/Locale'
import type { UiStrings } from './dictionary'

export interface LocaleContextValue {
  readonly locale: Locale
  readonly t: UiStrings
  readonly setLocale: (locale: Locale) => void
  readonly toggleLocale: () => void
}

/**
 * Kept apart from the provider so that file exports a component and nothing
 * else, which is what React Fast Refresh needs to hot-swap it cleanly.
 */
export const LocaleContext = createContext<LocaleContextValue | null>(null)
