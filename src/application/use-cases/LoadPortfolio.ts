import type { Journey } from '@domain/narrative/Journey'
import type { JourneyCopyRepository } from '@domain/ports/JourneyCopyRepository'
import type { ProfileRepository } from '@domain/ports/ProfileRepository'
import type { ProjectRepository } from '@domain/ports/ProjectRepository'
import type { Profile } from '@domain/profile/Profile'
import type { Project } from '@domain/projects/Project'
import type { Locale } from '@domain/shared/Locale'
import { buildJourney } from './BuildJourney'

export interface Portfolio {
  readonly locale: Locale
  readonly profile: Profile
  readonly projects: readonly Project[]
  readonly journey: Journey
}

export interface LoadPortfolioDeps {
  readonly profiles: ProfileRepository
  readonly projects: ProjectRepository
  readonly journeyCopy: JourneyCopyRepository
}

export type LoadPortfolio = (locale: Locale) => Promise<Portfolio>

/**
 * Loads everything the site needs for one locale, in one pass.
 *
 * Depends only on ports, so the whole application layer can be exercised in a
 * test with three hand-written fakes and no filesystem, no network and no DOM.
 */
export function createLoadPortfolio({
  profiles,
  projects,
  journeyCopy,
}: LoadPortfolioDeps): LoadPortfolio {
  return async (locale) => {
    // Independent reads: no reason to make the visitor wait for them in series.
    const [profile, projectList, copy] = await Promise.all([
      profiles.load(locale),
      projects.list(locale),
      journeyCopy.load(locale),
    ])

    return {
      locale,
      profile,
      projects: projectList,
      journey: buildJourney({ profile, projects: projectList, copy }),
    }
  }
}
