import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_LOCALE, isLocale, type Locale } from '@domain/shared/Locale'
import { DICTIONARY } from './dictionary'
import { LocaleContext, type LocaleContextValue } from './LocaleContext'

const STORAGE_KEY = 'portfolio.locale'

/**
 * Resolves the starting language.
 *
 * Order: what the visitor chose last, then what their browser asks for, then
 * Spanish. Wrapped in try/catch because localStorage throws outright in some
 * privacy modes, and a language preference is never worth a blank page.
 */
function initialLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored !== null && isLocale(stored)) return stored
  } catch {
    // Storage unavailable; fall through to the browser preference.
  }

  const preferred = window.navigator.language.slice(0, 2)
  return isLocale(preferred) ? preferred : DEFAULT_LOCALE
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  useEffect(() => {
    document.documentElement.lang = locale

    try {
      window.localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      // A visitor who blocks storage still gets the language they picked for
      // this session; only the memory of it is lost.
    }
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
  }, [])

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => (current === 'es' ? 'en' : 'es'))
  }, [])

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, t: DICTIONARY[locale], setLocale, toggleLocale }),
    [locale, setLocale, toggleLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
