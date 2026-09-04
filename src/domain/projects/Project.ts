import { invariant } from '../shared/DomainError'
import { requireText } from '../shared/guards'

export interface ProjectLinks {
  readonly repository: string | null
  readonly demo: string | null
}

export interface ProjectProps {
  readonly id: string
  readonly name: string
  /** One line. What it is, in the visitor's language, not the author's. */
  readonly tagline: string
  readonly description: string
  /** What *this person* did. A portfolio without a stated role explains nothing. */
  readonly role: string
  readonly year: number
  readonly skillIds: readonly string[]
  readonly links: ProjectLinks
  readonly featured: boolean
  readonly highlights: readonly string[]
}

const EARLIEST_PLAUSIBLE_YEAR = 1990
const LATEST_PLAUSIBLE_YEAR = 2100

function requireHttpsUrl(value: string | null, label: string): string | null {
  if (value === null) return null

  const url = requireText(value, label)
  invariant(/^https:\/\/.+/.test(url), `${label} must be an absolute https URL, received "${url}"`)
  return url
}

export class Project {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly tagline: string,
    readonly description: string,
    readonly role: string,
    readonly year: number,
    readonly skillIds: readonly string[],
    readonly links: ProjectLinks,
    readonly featured: boolean,
    readonly highlights: readonly string[],
  ) {
    Object.freeze(this)
  }

  static create(props: ProjectProps): Project {
    invariant(
      Number.isInteger(props.year) &&
        props.year >= EARLIEST_PLAUSIBLE_YEAR &&
        props.year <= LATEST_PLAUSIBLE_YEAR,
      `Project year ${props.year} is implausible, which usually means a typo in the content file`,
    )

    const links: ProjectLinks = Object.freeze({
      repository: requireHttpsUrl(props.links.repository, 'Project repository link'),
      demo: requireHttpsUrl(props.links.demo, 'Project demo link'),
    })

    return new Project(
      requireText(props.id, 'Project id'),
      requireText(props.name, 'Project name'),
      requireText(props.tagline, 'Project tagline'),
      props.description,
      requireText(props.role, 'Project role'),
      props.year,
      Object.freeze([...props.skillIds]),
      links,
      props.featured,
      Object.freeze([...props.highlights]),
    )
  }

  get hasLinks(): boolean {
    return this.links.repository !== null || this.links.demo !== null
  }

  /**
   * Display order: what the author chose to feature, then what is most recent.
   *
   * Named for what it means rather than how it sorts — the first thing a
   * visitor sees should be the strongest promise, not the newest commit.
   */
  static byPromise(this: void, a: Project, b: Project): number {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return b.year - a.year
  }
}
