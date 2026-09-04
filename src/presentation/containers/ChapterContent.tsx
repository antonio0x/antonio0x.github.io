import { useMemo } from 'react'
import type { Portfolio } from '@application/use-cases/LoadPortfolio'
import type { Chapter } from '@domain/narrative/Chapter'
import { Project } from '@domain/projects/Project'
import { CertificationList } from '../components/organisms/CertificationList'
import { ContactPanel } from '../components/organisms/ContactPanel'
import { EducationList } from '../components/organisms/EducationList'
import { ExperienceList } from '../components/organisms/ExperienceList'
import { HeroMeta } from '../components/organisms/HeroMeta'
import { ProjectGrid } from '../components/organisms/ProjectGrid'
import { SetupList } from '../components/organisms/SetupList'
import { SkillClusters } from '../components/organisms/SkillClusters'
import { formatDuration } from '../lib/format'
import { useLocale } from '../i18n/useLocale'

export interface ChapterContentProps {
  chapter: Chapter
  portfolio: Portfolio
}

/**
 * Resolves the data each chapter needs and hands it to a presentational organism.
 *
 * All the id-to-entity lookups live here on purpose. A component that has to
 * go find its own data cannot be rendered from a fixture, and a component that
 * cannot be rendered from a fixture never really gets tested.
 */
export function ChapterContent({ chapter, portfolio }: ChapterContentProps) {
  const { locale, t } = useLocale()
  const { profile, projects } = portfolio

  const skillsOf = useMemo(
    () => (ids: readonly string[]) =>
      ids.flatMap((id) => {
        const skill = profile.skillById(id)
        return skill === null ? [] : [skill]
      }),
    [profile],
  )

  switch (chapter.id) {
    case 'intro':
      return (
        <HeroMeta
          location={profile.location}
          headline={profile.headline}
          experience={formatDuration(profile.totalExperienceMonths(), locale, t.duration)}
          portrait={profile.portrait}
        />
      )

    case 'origin':
      return <EducationList entries={profile.education.filter((entry) => !entry.isOngoing)} />

    case 'foundations':
      return <CertificationList entries={profile.certifications} />

    case 'craft':
      return (
        <ExperienceList
          entries={profile.experiences.map((experience) => ({
            experience,
            skills: skillsOf(experience.skillIds),
          }))}
        />
      )

    case 'stack':
      return <SkillClusters groups={[...profile.skillsByCategory()]} />

    case 'workshop':
      return <SetupList items={profile.setup} />

    case 'work':
      return (
        <ProjectGrid
          entries={[...projects].sort(Project.byPromise).map((project) => ({
            project,
            skills: skillsOf(project.skillIds),
          }))}
        />
      )

    case 'horizon':
      return <EducationList entries={profile.education.filter((entry) => entry.isOngoing)} />

    case 'contact':
      return <ContactPanel channels={profile.channels} languages={profile.languages} />

    default:
      return null
  }
}
