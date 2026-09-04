import { describe, expect, it } from 'vitest'
import { DomainError } from '../shared/DomainError'
import { NarrativeNode } from './NarrativeNode'

const validProps = {
  id: 'skill-docker',
  chapterId: 'stack',
  kind: 'skill' as const,
  label: 'Docker',
  weight: 0.7,
}

describe('NarrativeNode', () => {
  it('exposes the props it was built from', () => {
    const node = NarrativeNode.create(validProps)

    expect(node.id).toBe('skill-docker')
    expect(node.chapterId).toBe('stack')
    expect(node.kind).toBe('skill')
    expect(node.label).toBe('Docker')
    expect(node.weight).toBe(0.7)
  })

  it('rejects a blank id, chapter or label', () => {
    expect(() => NarrativeNode.create({ ...validProps, id: '  ' })).toThrow(DomainError)
    expect(() => NarrativeNode.create({ ...validProps, chapterId: '' })).toThrow(DomainError)
    expect(() => NarrativeNode.create({ ...validProps, label: '' })).toThrow(DomainError)
  })

  it('constrains weight to the 0..1 range the renderer expects', () => {
    expect(() => NarrativeNode.create({ ...validProps, weight: 1.4 })).toThrow(DomainError)
    expect(() => NarrativeNode.create({ ...validProps, weight: -0.1 })).toThrow(DomainError)
    expect(() => NarrativeNode.create({ ...validProps, weight: 0 })).not.toThrow()
    expect(() => NarrativeNode.create({ ...validProps, weight: 1 })).not.toThrow()
  })

  it('defaults weight to a mid value when omitted so content authors can skip it', () => {
    const node = NarrativeNode.create({
      id: 'n',
      chapterId: 'c',
      kind: 'milestone',
      label: 'Something',
    })

    expect(node.weight).toBe(0.5)
  })

  it('is frozen so no consumer can mutate the graph behind the aggregate', () => {
    const node = NarrativeNode.create(validProps)

    expect(Object.isFrozen(node)).toBe(true)
  })
})
