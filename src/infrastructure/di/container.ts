import { createLoadPortfolio, type LoadPortfolio } from '@application/use-cases/LoadPortfolio'
import type { GraphLayoutService } from '@domain/ports/GraphLayoutService'
import type { JourneyCopyRepository } from '@domain/ports/JourneyCopyRepository'
import type { ProfileRepository } from '@domain/ports/ProfileRepository'
import type { ProjectRepository } from '@domain/ports/ProjectRepository'
import { CuratedProjectRepository } from '../content/CuratedProjectRepository'
import { StaticJourneyCopyRepository } from '../content/StaticJourneyCopyRepository'
import { StaticProfileRepository } from '../content/StaticProfileRepository'
import { HelixGraphLayout } from '../layout/HelixGraphLayout'

export interface Container {
  readonly profiles: ProfileRepository
  readonly projects: ProjectRepository
  readonly journeyCopy: JourneyCopyRepository
  readonly layout: GraphLayoutService
  readonly loadPortfolio: LoadPortfolio
}

/**
 * Composition root.
 *
 * The only place in the codebase allowed to choose concrete adapters. Every
 * other module asks for a port and receives whatever was wired here, which is
 * what makes the dependency arrows in the architecture real rather than
 * aspirational.
 */
export function createContainer(overrides: Partial<Container> = {}): Container {
  const profiles = overrides.profiles ?? new StaticProfileRepository()
  const projects = overrides.projects ?? new CuratedProjectRepository()
  const journeyCopy = overrides.journeyCopy ?? new StaticJourneyCopyRepository()
  const layout = overrides.layout ?? new HelixGraphLayout()

  return {
    profiles,
    projects,
    journeyCopy,
    layout,
    loadPortfolio: overrides.loadPortfolio ?? createLoadPortfolio({ profiles, projects, journeyCopy }),
  }
}

let shared: Container | null = null

/** The application-wide container. Tests build their own instead of using this. */
export function getContainer(): Container {
  shared ??= createContainer()
  return shared
}
