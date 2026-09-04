import { describe, expect, it } from 'vitest'
import { DomainError } from '../shared/DomainError'
import { Edge } from './Edge'

describe('Edge', () => {
  it('connects two node ids with a strength', () => {
    const edge = Edge.create({ from: 'origin', to: 'skill-linux', strength: 0.8 })

    expect(edge.from).toBe('origin')
    expect(edge.to).toBe('skill-linux')
    expect(edge.strength).toBe(0.8)
  })

  it('defaults strength so most content can omit it', () => {
    expect(Edge.create({ from: 'a', to: 'b' }).strength).toBe(0.5)
  })

  it('rejects a self-referencing edge', () => {
    expect(() => Edge.create({ from: 'a', to: 'a' })).toThrow(DomainError)
  })

  it('rejects a blank endpoint', () => {
    expect(() => Edge.create({ from: '', to: 'b' })).toThrow(DomainError)
    expect(() => Edge.create({ from: 'a', to: '   ' })).toThrow(DomainError)
  })

  it('constrains strength to 0..1', () => {
    expect(() => Edge.create({ from: 'a', to: 'b', strength: 2 })).toThrow(DomainError)
    expect(() => Edge.create({ from: 'a', to: 'b', strength: -1 })).toThrow(DomainError)
  })

  it('treats connections as undirected when asked', () => {
    const edge = Edge.create({ from: 'a', to: 'b' })

    expect(edge.connects('a')).toBe(true)
    expect(edge.connects('b')).toBe(true)
    expect(edge.connects('c')).toBe(false)
    expect(edge.otherEnd('a')).toBe('b')
    expect(edge.otherEnd('b')).toBe('a')
    expect(edge.otherEnd('c')).toBeNull()
  })

  it('has a stable id derived from its endpoints so React keys stay consistent', () => {
    expect(Edge.create({ from: 'a', to: 'b' }).id).toBe('a->b')
  })
})
