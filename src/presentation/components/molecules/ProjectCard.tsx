import type { Project } from '@domain/projects/Project'
import type { Skill } from '@domain/profile/Skill'
import { SmartLink } from '../atoms/SmartLink'
import { Tag } from '../atoms/Tag'
import { repoPath } from '../../lib/repoPath'
import { useLocale } from '../../i18n/useLocale'

export interface ProjectCardProps {
  project: Project
  skills: readonly Skill[]
}

export function ProjectCard({ project, skills }: ProjectCardProps) {
  const { t } = useLocale()
  const repo = project.links.repository === null ? null : repoPath(project.links.repository)

  return (
    <li
      className={[
        'group flex flex-col rounded-2xl border bg-surface/90 p-6 transition-colors duration-300 focus-within:border-signal-dim',
        // A featured project takes the full width of the grid. Emphasis by size
        // is read before emphasis by badge, and the badge alone was asking the
        // visitor to notice a label in order to notice the work.
        project.featured
          ? 'border-line-bright ring-1 ring-signal-dim/25 hover:border-signal-dim md:col-span-2'
          : 'border-line hover:border-line-bright',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl">{project.name}</h3>
        {project.featured && <Tag tone="ember">{t.featured}</Tag>}
      </div>

      <p className="mt-1 text-sm text-signal">{project.tagline}</p>

      {repo !== null && (
        <p className="mt-3 font-mono text-xs tracking-wide text-ink-faint">
          <span aria-hidden="true">◇ </span>
          {repo}
        </p>
      )}
      <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-muted">{project.description}</p>

      {project.highlights.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm text-ink-muted">
          {project.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2">
              <span aria-hidden="true" className="text-signal-deep">
                ▸
              </span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      )}

      {skills.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <li key={skill.id}>
              <Tag>{skill.name}</Tag>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        {project.links.repository !== null && (
          <SmartLink
            href={project.links.repository}
            external
            ariaLabel={`${t.viewCode} — ${project.name}`}
            className="font-medium text-signal underline-offset-4 hover:underline"
          >
            {t.viewCode} →
          </SmartLink>
        )}
        {project.links.demo !== null && (
          <SmartLink
            href={project.links.demo}
            external
            ariaLabel={`${t.viewDemo} — ${project.name}`}
            className="font-medium text-ink underline-offset-4 hover:underline"
          >
            {t.viewDemo} →
          </SmartLink>
        )}
      </div>
    </li>
  )
}
