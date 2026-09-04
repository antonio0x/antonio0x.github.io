import type { Project } from '../projects/Project'
import type { Locale } from '../shared/Locale'

export interface ProjectRepository {
  list(locale: Locale): Promise<readonly Project[]>
}
