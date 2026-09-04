import type { Locale } from '../shared/Locale'

/** The prose for one chapter, already resolved for a locale by the adapter. */
export interface ChapterCopy {
  readonly id: string
  readonly title: string
  readonly body: string
}

export interface JourneyCopyRepository {
  load(locale: Locale): Promise<readonly ChapterCopy[]>
}
