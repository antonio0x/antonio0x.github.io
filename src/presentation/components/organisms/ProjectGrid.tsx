import type { Skill } from '@domain/profile/Skill'
import type { Project } from '@domain/projects/Project'
import { ProjectCard } from '../molecules/ProjectCard'

export interface ProjectGridProps {
  entries: readonly { project: Project; skills: readonly Skill[] }[]
}

/**
 * The project grid.
 *
 * `auto-rows-fr` keeps side-by-side cards the same height regardless of how
 * much text each carries, so a short description does not produce a card that
 * looks unfinished next to a long one.
 */
export function ProjectGrid({ entries }: ProjectGridProps) {
  return (
    <ul className="mt-14 grid auto-rows-fr gap-6 md:grid-cols-2">
      {entries.map(({ project, skills }) => (
        <ProjectCard key={project.id} project={project} skills={skills} />
      ))}
    </ul>
  )
}
