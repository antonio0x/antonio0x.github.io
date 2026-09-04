import type { ChapterCopy, JourneyCopyRepository } from '@domain/ports/JourneyCopyRepository'
import type { Locale } from '@domain/shared/Locale'
import journey from '@content/journey.json'

/** Chapter prose, resolved for one locale. */
export class StaticJourneyCopyRepository implements JourneyCopyRepository {
  load(locale: Locale): Promise<readonly ChapterCopy[]> {
    return Promise.resolve(journey[locale])
  }
}
