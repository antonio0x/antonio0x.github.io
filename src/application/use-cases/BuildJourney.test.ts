import { describe, expect, it } from 'vitest'
import { DomainError } from '@domain/shared/DomainError'
import { CHAPTER_IDS } from '@domain/narrative/chapterIds'
import { Certification } from '@domain/profile/Certification'
import { ContactChannel } from '@domain/profile/ContactChannel'
import { Education } from '@domain/profile/Education'
import { Experience } from '@domain/profile/Experience'
import { Period } from '@domain/profile/Period'
import { Profile } from '@domain/profile/Profile'
import { SetupItem } from '@domain/profile/SetupItem'
import { Skill } from '@domain/profile/Skill'
import { Project } from '@domain/projects/Project'
import type { ChapterCopy } from '@domain/ports/JourneyCopyRepository'
import { buildJourney } from './BuildJourney'

const copy = (): ChapterCopy[] =>
  CHAPTER_IDS.map((id) => ({ id, title: `T ${id}`, body: `B ${id}` }))

const profileWith = (overrides: Partial<Parameters<typeof Profile.create>[0]> = {}) =>
  Profile.create({
    fullName: 'Roberto Antonio Quintanilla Aguilar',
    displayName: 'Antonio Quintanilla',
    headline: 'Analista Programador',
    location: 'El Salvador',
    summary: 'Resumen',
    skills: [
      Skill.create({ id: 'php', name: 'PHP', category: 'language', proficiency: 'core' }),
      Skill.create({ id: 'docker', name: 'Docker', category: 'devops', proficiency: 'familiar' }),
    ],
    experiences: [
      Experience.create({
        id: 'oss',
        organization: 'Open Solutions Systems',
        role: 'Soporte Técnico',
        period: Period.create('2025-08', null),
        mode: 'hybrid',
        highlights: ['Soporte de sistemas PHP'],
        skillIds: ['php'],
      }),
    ],
    education: [
      Education.create({
        id: 'ing',
        institution: 'UGB',
        program: 'Ingeniería en Sistemas y Redes',
        period: Period.create('2019', '2025'),
        status: 'completed',
      }),
    ],
    certifications: [
      Certification.create({ id: 'docker-cert', name: 'Docker', issuer: 'DevTalles' }),
    ],
    channels: [ContactChannel.create({ kind: 'email', label: 'a@b.c', href: 'mailto:a@b.c' })],
    languages: [{ name: 'Español', level: 'Nativo' }],
    ...overrides,
  })

const projectsWith = (skillIds: string[] = ['php']) => [
  Project.create({
    id: 'at-sv',
    name: 'AT-SV',
    tagline: 'Asistente tributario',
    description: '',
    role: 'Dev',
    year: 2026,
    skillIds,
    links: { repository: 'https://github.com/antonio0x/AT-SV', demo: null },
    featured: true,
    highlights: [],
  }),
]

describe('buildJourney', () => {
  it('keeps the surviving chapters in narrative order with contiguous indices', () => {
    const journey = buildJourney({ profile: profileWith(), projects: projectsWith(), copy: copy() })
    const ids = journey.chapters.map((c) => c.id)

    // A subsequence of the canonical order: chapters may be dropped, never reordered.
    expect(ids).toEqual(CHAPTER_IDS.filter((id) => ids.includes(id)))
    expect(journey.chapters.map((c) => c.index)).toEqual(ids.map((_, i) => i))
  })

  it('carries the localized copy onto each chapter', () => {
    const journey = buildJourney({ profile: profileWith(), projects: projectsWith(), copy: copy() })
    const intro = journey.chapters[0]!

    expect(intro.title).toBe(`T ${intro.id}`)
    expect(intro.body).toBe(`B ${intro.id}`)
  })

  it('fails loudly when a chapter has no copy, rather than rendering a blank beat', () => {
    const incomplete = copy().filter((c) => c.id !== 'stack')

    expect(() =>
      buildJourney({ profile: profileWith(), projects: projectsWith(), copy: incomplete }),
    ).toThrow(DomainError)
  })

  describe('node derivation', () => {
    const journey = () =>
      buildJourney({ profile: profileWith(), projects: projectsWith(), copy: copy() })

    it('places the person at the centre of the intro chapter', () => {
      const [identity] = journey().nodesOf('intro')

      expect(identity?.kind).toBe('identity')
      expect(identity?.label).toBe('Antonio Quintanilla')
      expect(identity?.weight).toBe(1)
    })

    it('turns completed education into origin milestones', () => {
      expect(journey().nodesOf('origin').map((n) => n.kind)).toEqual(['milestone'])
    })

    it('turns certifications into foundation milestones', () => {
      expect(journey().nodesOf('foundations').map((n) => n.label)).toEqual(['Docker'])
    })

    it('turns experiences into role nodes', () => {
      const [role] = journey().nodesOf('craft')

      expect(role?.kind).toBe('role')
      expect(role?.label).toBe('Open Solutions Systems')
    })

    it('turns skills into stack nodes weighted by proficiency', () => {
      const stack = journey().nodesOf('stack')

      expect(stack.map((n) => n.label)).toEqual(['PHP', 'Docker'])
      expect(stack.find((n) => n.label === 'PHP')?.weight).toBe(1)
      expect(stack.find((n) => n.label === 'Docker')?.weight).toBe(0.45)
    })

    it('turns projects into work nodes', () => {
      expect(journey().nodesOf('work').map((n) => n.kind)).toEqual(['project'])
    })

    it('turns contact channels into contact nodes', () => {
      expect(journey().nodesOf('contact').map((n) => n.kind)).toEqual(['contact'])
    })

    it('gives every node a unique id even across kinds', () => {
      const ids = journey().nodes.map((n) => n.id)

      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('edge derivation', () => {
    it('wires a role to each skill it exercised', () => {
      const journey = buildJourney({
        profile: profileWith(),
        projects: projectsWith(),
        copy: copy(),
      })

      expect(journey.neighboursOf('skill:php')).toContain('role:oss')
    })

    it('wires a project to each skill in its stack', () => {
      const journey = buildJourney({
        profile: profileWith(),
        projects: projectsWith(['docker']),
        copy: copy(),
      })

      expect(journey.neighboursOf('project:at-sv')).toContain('skill:docker')
    })

    it('refuses a project citing a skill the profile never declares', () => {
      expect(() =>
        buildJourney({ profile: profileWith(), projects: projectsWith(['rust']), copy: copy() }),
      ).toThrow(DomainError)
    })

    it('connects consecutive chapters so the network reads as one graph', () => {
      const journey = buildJourney({
        profile: profileWith(),
        projects: projectsWith(),
        copy: copy(),
      })

      const reachable = new Set<string>(['identity:root'])
      let added = true
      while (added) {
        added = false
        for (const id of [...reachable]) {
          for (const neighbour of journey.neighboursOf(id)) {
            if (!reachable.has(neighbour)) {
              reachable.add(neighbour)
              added = true
            }
          }
        }
      }

      expect(reachable.size).toBe(journey.nodes.length)
    })
  })

  describe('chapters with nothing to show', () => {
    it('drops an empty chapter and re-indexes the rest contiguously', () => {
      const journey = buildJourney({
        profile: profileWith({ certifications: [] }),
        projects: projectsWith(),
        copy: copy(),
      })

      expect(journey.chapters.map((c) => c.id)).not.toContain('foundations')
      expect(journey.chapters.map((c) => c.index)).toEqual(
        journey.chapters.map((_, index) => index),
      )
    })

    it('drops the horizon chapter when nothing is in progress', () => {
      expect(
        buildJourney({ profile: profileWith(), projects: projectsWith(), copy: copy() }).chapters.map(
          (c) => c.id,
        ),
      ).not.toContain('horizon')
    })

    it('keeps the horizon chapter when a programme is under way', () => {
      const profile = profileWith({
        education: [
          Education.create({
            id: 'ing',
            institution: 'UGB',
            program: 'Ingeniería',
            period: Period.create('2019', '2025'),
            status: 'completed',
          }),
          Education.create({
            id: 'cloud',
            institution: 'UGB',
            program: 'Pre-especialización en la Nube',
            period: Period.create('2025-08', null),
            status: 'in-progress',
          }),
        ],
      })

      const journey = buildJourney({ profile, projects: projectsWith(), copy: copy() })

      expect(journey.chapters.map((c) => c.id)).toContain('horizon')
      expect(journey.nodesOf('horizon').map((n) => n.kind)).toEqual(['horizon'])
    })
  })
})

const setup = () => [
  SetupItem.create({
    id: 'arch',
    name: 'Arch Linux',
    category: 'distro',
    note: 'Built up from a base install.',
    url: null,
  }),
  SetupItem.create({
    id: 'neovim',
    name: 'Neovim',
    category: 'editor',
    note: 'Configured by hand.',
    url: null,
  }),
]

describe('the workshop chapter', () => {
  it('is skipped entirely when the profile declares no setup', () => {
    // Same rule as every other chapter: an empty beat is worse than no beat.
    const journey = buildJourney({ profile: profileWith(), projects: [], copy: copy() })

    expect(journey.chapters.map((chapter) => chapter.id)).not.toContain('workshop')
  })

  it('turns each setup item into a node of its own kind', () => {
    const journey = buildJourney({ profile: profileWith({ setup: setup() }), projects: [], copy: copy() })
    const nodes = journey.nodes.filter((node) => node.chapterId === 'workshop')

    expect(nodes).toHaveLength(2)
    expect(nodes.every((node) => node.kind === 'setup')).toBe(true)
    expect(nodes.map((node) => node.id)).toEqual(['setup:arch', 'setup:neovim'])
  })

  it('namespaces setup nodes so a tool and a skill of the same name cannot collide', () => {
    const journey = buildJourney({
      profile: profileWith({
        skills: [Skill.create({ id: 'neovim', name: 'Neovim', category: 'tool', proficiency: 'core' })],
        experiences: [],
        setup: setup(),
      }),
      projects: [],
      copy: copy(),
    })

    const ids = journey.nodes.map((node) => node.id)
    expect(ids).toContain('setup:neovim')
    expect(ids).toContain('skill:neovim')
  })

  it('sits between the stack and the work, so tools come before what was built with them', () => {
    const journey = buildJourney({ profile: profileWith({ setup: setup() }), projects: [], copy: copy() })
    const ids = journey.chapters.map((chapter) => chapter.id)

    expect(ids.indexOf('workshop')).toBeGreaterThan(ids.indexOf('stack'))
  })
})
