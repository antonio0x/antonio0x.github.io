import { describe, expect, it } from 'vitest'
import { DomainError } from '../shared/DomainError'
import { Chapter } from './Chapter'
import { Edge } from './Edge'
import { Journey } from './Journey'
import { NarrativeNode } from './NarrativeNode'

const chapter = (id: string, index: number) =>
  Chapter.create({ id, index, eyebrow: `Ch ${index}`, title: id, body: '', focusNodeId: null })

const node = (id: string, chapterId: string) =>
  NarrativeNode.create({ id, chapterId, kind: 'milestone', label: id })

/** Three chapters, one node each, chained head to tail. */
function buildJourney() {
  return Journey.create({
    chapters: [chapter('intro', 0), chapter('origin', 1), chapter('stack', 2)],
    nodes: [node('a', 'intro'), node('b', 'origin'), node('c', 'stack')],
    edges: [Edge.create({ from: 'a', to: 'b' }), Edge.create({ from: 'b', to: 'c' })],
  })
}

describe('Journey invariants', () => {
  it('requires at least one chapter', () => {
    expect(() => Journey.create({ chapters: [], nodes: [], edges: [] })).toThrow(DomainError)
  })

  it('rejects duplicate chapter ids', () => {
    expect(() =>
      Journey.create({
        chapters: [chapter('intro', 0), chapter('intro', 1)],
        nodes: [node('a', 'intro')],
        edges: [],
      }),
    ).toThrow(DomainError)
  })

  it('rejects duplicate node ids', () => {
    expect(() =>
      Journey.create({
        chapters: [chapter('intro', 0)],
        nodes: [node('a', 'intro'), node('a', 'intro')],
        edges: [],
      }),
    ).toThrow(DomainError)
  })

  it('requires chapter indices to run contiguously from zero', () => {
    expect(() =>
      Journey.create({
        chapters: [chapter('intro', 0), chapter('origin', 2)],
        nodes: [node('a', 'intro'), node('b', 'origin')],
        edges: [],
      }),
    ).toThrow(DomainError)
  })

  it('rejects a node pointing at a chapter that does not exist', () => {
    expect(() =>
      Journey.create({
        chapters: [chapter('intro', 0)],
        nodes: [node('a', 'intro'), node('ghost', 'nowhere')],
        edges: [],
      }),
    ).toThrow(DomainError)
  })

  it('rejects a chapter with no nodes, because an empty chapter renders nothing', () => {
    expect(() =>
      Journey.create({
        chapters: [chapter('intro', 0), chapter('empty', 1)],
        nodes: [node('a', 'intro')],
        edges: [],
      }),
    ).toThrow(DomainError)
  })

  it('rejects an edge whose endpoint is not a known node', () => {
    expect(() =>
      Journey.create({
        chapters: [chapter('intro', 0)],
        nodes: [node('a', 'intro')],
        edges: [Edge.create({ from: 'a', to: 'ghost' })],
      }),
    ).toThrow(DomainError)
  })

  it('rejects a focus node that does not belong to its own chapter', () => {
    expect(() =>
      Journey.create({
        chapters: [
          Chapter.create({
            id: 'intro',
            index: 0,
            eyebrow: '',
            title: 'Intro',
            body: '',
            focusNodeId: 'b',
          }),
          chapter('origin', 1),
        ],
        nodes: [node('a', 'intro'), node('b', 'origin')],
        edges: [],
      }),
    ).toThrow(DomainError)
  })
})

describe('Journey queries', () => {
  it('returns chapters ordered by index regardless of input order', () => {
    const journey = Journey.create({
      chapters: [chapter('stack', 2), chapter('intro', 0), chapter('origin', 1)],
      nodes: [node('a', 'intro'), node('b', 'origin'), node('c', 'stack')],
      edges: [],
    })

    expect(journey.chapters.map((c) => c.id)).toEqual(['intro', 'origin', 'stack'])
  })

  it('finds the nodes belonging to a chapter', () => {
    expect(buildJourney().nodesOf('origin').map((n) => n.id)).toEqual(['b'])
  })

  it('looks up a node by id', () => {
    expect(buildJourney().nodeById('b')?.label).toBe('b')
    expect(buildJourney().nodeById('missing')).toBeNull()
  })

  it('lists the neighbours of a node in both directions', () => {
    expect([...buildJourney().neighboursOf('b')].sort()).toEqual(['a', 'c'])
    expect(buildJourney().neighboursOf('a')).toEqual(['b'])
  })
})

describe('Journey progress mapping', () => {
  it('splits the scroll range evenly across chapters', () => {
    const journey = buildJourney()

    expect(journey.progressRangeOf('intro')).toEqual({ start: 0, end: 1 / 3 })
    expect(journey.progressRangeOf('origin')).toEqual({ start: 1 / 3, end: 2 / 3 })
    expect(journey.progressRangeOf('stack')).toEqual({ start: 2 / 3, end: 1 })
  })

  it('maps a progress value to the chapter that owns it', () => {
    const journey = buildJourney()

    expect(journey.chapterAtProgress(0).id).toBe('intro')
    expect(journey.chapterAtProgress(0.2).id).toBe('intro')
    expect(journey.chapterAtProgress(0.5).id).toBe('origin')
    expect(journey.chapterAtProgress(0.9).id).toBe('stack')
  })

  it('assigns a boundary value to the chapter that starts there', () => {
    expect(buildJourney().chapterAtProgress(1 / 3).id).toBe('origin')
  })

  it('clamps out-of-range progress instead of throwing', () => {
    const journey = buildJourney()

    expect(journey.chapterAtProgress(-5).id).toBe('intro')
    expect(journey.chapterAtProgress(1).id).toBe('stack')
    expect(journey.chapterAtProgress(42).id).toBe('stack')
  })

  it('reports local progress within the active chapter', () => {
    const journey = buildJourney()

    expect(journey.localProgressAt(0)).toBeCloseTo(0)
    expect(journey.localProgressAt(1 / 6)).toBeCloseTo(0.5)
    expect(journey.localProgressAt(1)).toBeCloseTo(1)
  })

  it('rejects a lookup for an unknown chapter', () => {
    expect(() => buildJourney().progressRangeOf('nope')).toThrow(DomainError)
  })
})

describe('Journey progressive reveal', () => {
  it('reveals only the nodes up to and including the given chapter', () => {
    const journey = buildJourney()

    expect(journey.nodesRevealedAt(0).map((n) => n.id)).toEqual(['a'])
    expect(journey.nodesRevealedAt(1).map((n) => n.id)).toEqual(['a', 'b'])
    expect(journey.nodesRevealedAt(2).map((n) => n.id)).toEqual(['a', 'b', 'c'])
  })

  it('reveals an edge only once both of its endpoints are revealed', () => {
    const journey = buildJourney()

    expect(journey.edgesRevealedAt(0)).toEqual([])
    expect(journey.edgesRevealedAt(1).map((e) => e.id)).toEqual(['a->b'])
    expect(journey.edgesRevealedAt(2).map((e) => e.id)).toEqual(['a->b', 'b->c'])
  })
})
