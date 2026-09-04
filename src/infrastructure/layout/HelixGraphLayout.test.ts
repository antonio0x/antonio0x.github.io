import { describe, expect, it } from 'vitest'
import { Chapter } from '@domain/narrative/Chapter'
import { Edge } from '@domain/narrative/Edge'
import { Journey } from '@domain/narrative/Journey'
import { NarrativeNode } from '@domain/narrative/NarrativeNode'
import type { Vec3 } from '@domain/shared/Vec3'
import { HelixGraphLayout } from './HelixGraphLayout'

const chapter = (id: string, index: number, focusNodeId: string) =>
  Chapter.create({ id, index, title: id, body: '', focusNodeId })

const node = (id: string, chapterId: string) =>
  NarrativeNode.create({ id, chapterId, kind: 'skill', label: id })

function buildJourney() {
  return Journey.create({
    chapters: [chapter('a', 0, 'a1'), chapter('b', 1, 'b1'), chapter('c', 2, 'c1')],
    nodes: [
      node('a1', 'a'),
      node('a2', 'a'),
      node('a3', 'a'),
      node('b1', 'b'),
      node('b2', 'b'),
      node('c1', 'c'),
    ],
    edges: [Edge.create({ from: 'a1', to: 'b1' })],
  })
}

const distance = (a: Vec3, b: Vec3) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

describe('HelixGraphLayout', () => {
  const layout = new HelixGraphLayout()

  it('places every node exactly once', () => {
    const placements = layout.place(buildJourney())

    expect(placements).toHaveLength(6)
    expect(new Set(placements.map((p) => p.nodeId)).size).toBe(6)
  })

  it('is deterministic, so a reload never reshuffles the network', () => {
    const first = layout.place(buildJourney())
    const second = new HelixGraphLayout().place(buildJourney())

    expect(first).toEqual(second)
  })

  it('never stacks two nodes on the same point', () => {
    const positions = layout.place(buildJourney()).map((p) => p.position.join(','))

    expect(new Set(positions).size).toBe(positions.length)
  })

  it('keeps a chapter cluster tighter than the gap to the next chapter', () => {
    const byId = new Map(layout.place(buildJourney()).map((p) => [p.nodeId, p.position]))

    const withinA = distance(byId.get('a1')!, byId.get('a2')!)
    const acrossToB = distance(byId.get('a1')!, byId.get('b1')!)

    expect(withinA).toBeLessThan(acrossToB)
  })

  it('descends as the story advances, so the camera always moves forward', () => {
    const byId = new Map(layout.place(buildJourney()).map((p) => [p.nodeId, p.position]))

    const heightOf = (id: string) => byId.get(id)![1]

    expect(heightOf('b1')).toBeLessThan(heightOf('a1'))
    expect(heightOf('c1')).toBeLessThan(heightOf('b1'))
  })

  it('anchors the chapter focus node at the centre of its cluster', () => {
    const byId = new Map(layout.place(buildJourney()).map((p) => [p.nodeId, p.position]))
    const centre = layout.chapterCentre(0)

    expect(distance(byId.get('a1')!, centre)).toBeCloseTo(0, 5)
  })

  it('produces finite coordinates for a single-node chapter', () => {
    const placements = layout.place(buildJourney())
    const c1 = placements.find((p) => p.nodeId === 'c1')!

    expect(c1.position.every(Number.isFinite)).toBe(true)
  })
})
