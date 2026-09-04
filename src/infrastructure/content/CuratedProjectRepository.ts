import type { ProjectRepository } from '@domain/ports/ProjectRepository'
import { Project } from '@domain/projects/Project'
import type { Locale } from '@domain/shared/Locale'
import projects from '@content/projects.json'

type RawProject = (typeof projects)['es'][number]

function toProject(raw: RawProject): Project {
  return Project.create({
    id: raw.id,
    name: raw.name,
    tagline: raw.tagline,
    description: raw.description,
    role: raw.role,
    year: raw.year,
    skillIds: raw.skillIds,
    links: { repository: raw.links.repository, demo: raw.links.demo },
    featured: raw.featured,
    highlights: raw.highlights,
  })
}

/**
 * Projects are curated by hand rather than pulled from the GitHub API.
 *
 * A generated list ranks by commit date; a portfolio ranks by what the author
 * is willing to be judged on. Those are not the same order, and the API cannot
 * tell the difference.
 */
export class CuratedProjectRepository implements ProjectRepository {
  private readonly cache = new Map<Locale, readonly Project[]>()

  list(locale: Locale): Promise<readonly Project[]> {
    const cached = this.cache.get(locale)
    if (cached !== undefined) {
      return Promise.resolve(cached)
    }

    const parsed = Object.freeze(projects[locale].map(toProject))
    this.cache.set(locale, parsed)
    return Promise.resolve(parsed)
  }
}
