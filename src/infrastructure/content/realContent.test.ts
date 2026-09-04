import { describe, expect, it } from 'vitest'
import { createLoadPortfolio } from '@application/use-cases/LoadPortfolio'
import { CHAPTER_IDS } from '@domain/narrative/chapterIds'
import { LOCALES } from '@domain/shared/Locale'
import { HelixGraphLayout } from '../layout/HelixGraphLayout'
import { CuratedProjectRepository } from './CuratedProjectRepository'
import { StaticJourneyCopyRepository } from './StaticJourneyCopyRepository'
import { StaticProfileRepository } from './StaticProfileRepository'

/**
 * The guardrail for the real content files.
 *
 * Every domain invariant already exists; this suite points them at the actual
 * JSON that ships. A typo in a skill id, a contact link that will not open, an
 * education entry whose status contradicts its dates — all of it fails here,
 * in CI, instead of white-screening a visitor.
 */
const loadPortfolio = createLoadPortfolio({
  profiles: new StaticProfileRepository(),
  projects: new CuratedProjectRepository(),
  journeyCopy: new StaticJourneyCopyRepository(),
})

describe.each(LOCALES)('real content [%s]', (locale) => {
  it('assembles a valid portfolio', async () => {
    const portfolio = await loadPortfolio(locale)

    expect(portfolio.profile.displayName).toBe('Antonio Quintanilla')
    expect(portfolio.projects.length).toBeGreaterThan(0)
    expect(portfolio.journey.chapters.length).toBeGreaterThan(0)
  })

  it('only uses chapter ids the narrative knows about', async () => {
    const { journey } = await loadPortfolio(locale)

    for (const chapter of journey.chapters) {
      expect(CHAPTER_IDS).toContain(chapter.id)
    }
  })

  it('tells the whole story, with nothing silently dropped', async () => {
    const { journey } = await loadPortfolio(locale)

    // Every chapter is populated by the current CV, so all eight must survive.
    expect(journey.chapters.map((chapter) => chapter.id)).toEqual([...CHAPTER_IDS])
  })

  it('gives every chapter real prose, not a placeholder', async () => {
    const { journey } = await loadPortfolio(locale)

    for (const chapter of journey.chapters) {
      expect(chapter.title.trim().length).toBeGreaterThan(0)
      expect(chapter.body.trim().length).toBeGreaterThan(20)
    }
  })

  it('lays out every node at a finite, distinct position', async () => {
    const { journey } = await loadPortfolio(locale)
    const placements = new HelixGraphLayout().place(journey)

    expect(placements).toHaveLength(journey.nodes.length)
    expect(placements.every((p) => p.position.every(Number.isFinite))).toBe(true)
    expect(new Set(placements.map((p) => p.position.join(','))).size).toBe(placements.length)
  })

  it('offers at least an email and a repository to reach the author', async () => {
    const { profile } = await loadPortfolio(locale)

    expect(profile.channelOfKind('email')).not.toBeNull()
    expect(profile.channelOfKind('github')).not.toBeNull()
  })

  it('links every project to somewhere real', async () => {
    const { projects } = await loadPortfolio(locale)

    for (const project of projects) {
      expect(project.hasLinks).toBe(true)
    }
  })

  it('reports a plausible amount of professional experience', async () => {
    const { profile } = await loadPortfolio(locale)
    const months = profile.totalExperienceMonths(new Date('2026-08-31T00:00:00Z'))

    expect(months).toBeGreaterThan(0)
    expect(months).toBeLessThan(12 * 50)
  })
})

describe('content parity across locales', () => {
  it('describes the same skills in both languages', async () => {
    const [es, en] = await Promise.all([loadPortfolio('es'), loadPortfolio('en')])

    expect(es.profile.skills.map((s) => s.id)).toEqual(en.profile.skills.map((s) => s.id))
  })

  it('describes the same projects in both languages', async () => {
    const [es, en] = await Promise.all([loadPortfolio('es'), loadPortfolio('en')])

    expect(es.projects.map((p) => p.id)).toEqual(en.projects.map((p) => p.id))
  })

  it('builds the same network shape in both languages', async () => {
    const [es, en] = await Promise.all([loadPortfolio('es'), loadPortfolio('en')])

    expect(es.journey.nodes.map((n) => n.id)).toEqual(en.journey.nodes.map((n) => n.id))
    expect(es.journey.edges.map((e) => e.id)).toEqual(en.journey.edges.map((e) => e.id))
  })
})
