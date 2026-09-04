import { describe, expect, it } from 'vitest'
import { DomainError } from '../shared/DomainError'
import { Project } from './Project'

const base = {
  id: 'at-sv',
  name: 'AT-SV',
  tagline: 'Asistente tributario para El Salvador',
  description: 'Guía de consultas fiscales.',
  role: 'Desarrollador',
  year: 2026,
  skillIds: ['typescript'],
  links: { repository: 'https://github.com/antonio0x/AT-SV', demo: null },
  featured: true,
  highlights: ['Modeló el dominio fiscal'],
}

describe('Project', () => {
  it('exposes the props it was built from', () => {
    const project = Project.create(base)

    expect(project.id).toBe('at-sv')
    expect(project.featured).toBe(true)
    expect(project.links.repository).toBe('https://github.com/antonio0x/AT-SV')
    expect(project.links.demo).toBeNull()
  })

  it('rejects a blank id, name or tagline', () => {
    expect(() => Project.create({ ...base, id: '' })).toThrow(DomainError)
    expect(() => Project.create({ ...base, name: ' ' })).toThrow(DomainError)
    expect(() => Project.create({ ...base, tagline: '' })).toThrow(DomainError)
  })

  it('rejects an implausible year, which usually means a typo in the content file', () => {
    expect(() => Project.create({ ...base, year: 1820 })).toThrow(DomainError)
    expect(() => Project.create({ ...base, year: 2999 })).toThrow(DomainError)
  })

  it('rejects a link that is not an absolute https url', () => {
    expect(() =>
      Project.create({ ...base, links: { repository: 'github.com/x', demo: null } }),
    ).toThrow(DomainError)
    expect(() =>
      Project.create({ ...base, links: { repository: null, demo: 'ftp://x.com' } }),
    ).toThrow(DomainError)
  })

  it('allows a project with no links at all', () => {
    expect(() =>
      Project.create({ ...base, links: { repository: null, demo: null } }),
    ).not.toThrow()
  })

  it('knows whether it has anywhere to send the visitor', () => {
    expect(Project.create(base).hasLinks).toBe(true)
    expect(
      Project.create({ ...base, links: { repository: null, demo: null } }).hasLinks,
    ).toBe(false)
  })

  it('sorts featured projects first, then by most recent year', () => {
    const projects = [
      Project.create({ ...base, id: 'old-featured', year: 2021, featured: true }),
      Project.create({ ...base, id: 'recent-plain', year: 2026, featured: false }),
      Project.create({ ...base, id: 'recent-featured', year: 2026, featured: true }),
    ]

    expect([...projects].sort(Project.byPromise).map((p) => p.id)).toEqual([
      'recent-featured',
      'old-featured',
      'recent-plain',
    ])
  })
})
