import { describe, expect, it } from 'vitest'
import { DomainError } from '../shared/DomainError'
import { Skill } from './Skill'

const base = {
  id: 'docker',
  name: 'Docker',
  category: 'devops' as const,
  proficiency: 'working' as const,
}

describe('Skill', () => {
  it('exposes the props it was built from', () => {
    const skill = Skill.create(base)

    expect(skill.id).toBe('docker')
    expect(skill.name).toBe('Docker')
    expect(skill.category).toBe('devops')
    expect(skill.proficiency).toBe('working')
  })

  it('rejects a blank id or name', () => {
    expect(() => Skill.create({ ...base, id: '' })).toThrow(DomainError)
    expect(() => Skill.create({ ...base, name: '  ' })).toThrow(DomainError)
  })

  describe('weight', () => {
    it('derives visual weight from proficiency so the graph never lies about depth', () => {
      expect(Skill.create({ ...base, proficiency: 'core' }).weight).toBe(1)
      expect(Skill.create({ ...base, proficiency: 'working' }).weight).toBe(0.7)
      expect(Skill.create({ ...base, proficiency: 'familiar' }).weight).toBe(0.45)
    })

    it('always produces a value the renderer can consume', () => {
      for (const proficiency of ['core', 'working', 'familiar'] as const) {
        const { weight } = Skill.create({ ...base, proficiency })
        expect(weight).toBeGreaterThan(0)
        expect(weight).toBeLessThanOrEqual(1)
      }
    })
  })

  it('ranks core skills above working ones above familiar ones', () => {
    const skills = [
      Skill.create({ ...base, id: 'a', proficiency: 'familiar' }),
      Skill.create({ ...base, id: 'b', proficiency: 'core' }),
      Skill.create({ ...base, id: 'c', proficiency: 'working' }),
    ]

    expect([...skills].sort(Skill.byProficiency).map((s) => s.id)).toEqual(['b', 'c', 'a'])
  })
})
