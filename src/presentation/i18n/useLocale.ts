import { useContext } from 'react'
import { LocaleContext, type LocaleContextValue } from './LocaleContext'

/** Reads the active locale and UI strings. Throws if used outside the provider. */
export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext)

  if (context === null) {
    throw new Error('useLocale must be used inside a <LocaleProvider>')
  }

  return context
}
