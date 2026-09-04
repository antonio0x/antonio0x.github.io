import { describe, expect, it } from 'vitest'
import { DomainError } from '../shared/DomainError'
import { ContactChannel } from './ContactChannel'
import { Education } from './Education'
import { Experience } from './Experience'
import { Period } from './Period'
import { Profile } from './Profile'
import { Portrait } from './Portrait'
import { SetupItem } from './SetupItem'
import { Skill } from './Skill'

const skill = (id: string, category: Parameters<typeof Skill.create>[0]['category'] = 'language') =>
  Skill.create({ id, name: id, category, proficiency: 'working' })

const experience = (id: string, start: string, end: string | null, skillIds: string[] = []) =>
  Experience.create({
    id,
    organization: `Org ${id}`,
    role: 'Developer',
    period: Period.create(start, end),
    mode: 'hybrid',
    highlights: ['Did the work'],
    skillIds,
  })

const education = () =>
  Education.create({
    id: 'ing',
    institution: 'UGB',
    program: 'Ingeniería en Sistemas y Redes',
    period: Period.create('2019', '2025'),
    status: 'completed',
  })

const email = () =>
  ContactChannel.create({ kind: 'email', label: 'a@b.c', href: 'mailto:a@b.c' })

const validProps = () => ({
  fullName: 'Roberto Antonio Quintanilla Aguilar',
  displayName: 'Antonio Quintanilla',
  headline: 'Analista Programador',
  location: 'El Salvador',
  summary: 'Ingeniería en Sistemas y Redes.',
  skills: [skill('php'), skill('docker', 'devops')],
  experiences: [experience('a', '2024-12', '2025-07', ['php'])],
  education: [education()],
  certifications: [],
  channels: [email()],
  languages: [{ name: 'Español', level: 'Nativo' }],
})

describe('Profile invariants', () => {
  it('builds from valid props', () => {
    const profile = Profile.create(validProps())

    expect(profile.displayName).toBe('Antonio Quintanilla')
    expect(profile.skills).toHaveLength(2)
  })

  it('rejects a blank name or headline', () => {
    expect(() => Profile.create({ ...validProps(), fullName: '' })).toThrow(DomainError)
    expect(() => Profile.create({ ...validProps(), headline: '  ' })).toThrow(DomainError)
  })

  it('requires at least one contact channel, or the portfolio has no call to action', () => {
    expect(() => Profile.create({ ...validProps(), channels: [] })).toThrow(DomainError)
  })

  it('rejects duplicate skill ids', () => {
    expect(() => Profile.create({ ...validProps(), skills: [skill('php'), skill('php')] })).toThrow(
      DomainError,
    )
  })

  it('rejects an experience referencing a skill the profile does not declare', () => {
    expect(() =>
      Profile.create({ ...validProps(), experiences: [experience('a', '2024-12', null, ['rust'])] }),
    ).toThrow(DomainError)
  })
})

describe('Profile queries', () => {
  it('finds a skill by id', () => {
    const profile = Profile.create(validProps())

    expect(profile.skillById('docker')?.category).toBe('devops')
    expect(profile.skillById('rust')).toBeNull()
  })

  it('groups skills by category, preserving declaration order within a group', () => {
    const profile = Profile.create({
      ...validProps(),
      skills: [skill('php'), skill('docker', 'devops'), skill('java'), skill('git', 'devops')],
    })

    const grouped = profile.skillsByCategory()

    expect(grouped.get('language')?.map((s) => s.id)).toEqual(['php', 'java'])
    expect(grouped.get('devops')?.map((s) => s.id)).toEqual(['docker', 'git'])
    expect(grouped.has('database')).toBe(false)
  })

  it('lists experiences most recent first', () => {
    const profile = Profile.create({
      ...validProps(),
      experiences: [
        experience('old', '2023-01', '2023-06'),
        experience('current', '2025-08', null),
        experience('mid', '2024-12', '2025-07'),
      ],
    })

    expect(profile.experiences.map((e) => e.id)).toEqual(['current', 'mid', 'old'])
  })

  it('counts total professional months without double-counting overlaps', () => {
    const profile = Profile.create({
      ...validProps(),
      experiences: [
        experience('a', '2024-01', '2024-06'), // 6 months
        experience('b', '2024-04', '2024-09'), // overlaps a by 3 months
      ],
    })

    // Jan through Sep 2024 inclusive.
    expect(profile.totalExperienceMonths()).toBe(9)
  })

  it('measures an ongoing role against the reference date', () => {
    const profile = Profile.create({
      ...validProps(),
      experiences: [experience('a', '2025-08', null)],
    })

    expect(profile.totalExperienceMonths(new Date('2026-08-31T00:00:00Z'))).toBe(13)
  })
})

const setupItem = (id: string, category: Parameters<typeof SetupItem.create>[0]['category']) =>
  SetupItem.create({ id, name: id, category, note: 'Because it fits the way I work.', url: null })

describe('Profile portrait and setup', () => {
  it('treats both as optional, so a profile without them is still valid', () => {
    const profile = Profile.create(validProps())

    expect(profile.portrait).toBeNull()
    expect(profile.setup).toEqual([])
  })

  it('keeps a portrait it was given', () => {
    const portrait = Portrait.create({
      src: '/portrait-512.jpg',
      webpSrc: null,
      alt: 'Antonio Quintanilla',
      width: 512,
      height: 512,
    })

    expect(Profile.create({ ...validProps(), portrait }).portrait).toBe(portrait)
  })

  it('orders setup items from the machine outwards, whatever order they were authored in', () => {
    const profile = Profile.create({
      ...validProps(),
      setup: [setupItem('catppuccin', 'theme'), setupItem('arch', 'distro'), setupItem('fish', 'shell')],
    })

    expect(profile.setup.map((item) => item.id)).toEqual(['arch', 'fish', 'catppuccin'])
  })

  it('rejects duplicate setup ids', () => {
    expect(() =>
      Profile.create({
        ...validProps(),
        setup: [setupItem('fish', 'shell'), setupItem('fish', 'shell')],
      }),
    ).toThrow(DomainError)
  })
})
