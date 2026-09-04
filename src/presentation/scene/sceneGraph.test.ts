import { describe, expect, it } from 'vitest'
import { Chapter } from '@domain/narrative/Chapter'
import { Edge } from '@domain/narrative/Edge'
import { Journey } from '@domain/narrative/Journey'
import { NarrativeNode } from '@domain/narrative/NarrativeNode'
import type { GraphLayoutService, NodePlacement } from '@domain/ports/GraphLayoutService'
import { HelixGraphLayout } from '@infrastructure/layout/HelixGraphLayout'
import { buildSceneGraph } from './sceneGraph'

const chapter = (id: string, index: number, focusNodeId: string) =>
  Chapter.create({ id, index, title: id, body: '', focusNodeId })

const node = (id: string, chapterId: string) =>
  NarrativeNode.create({ id, chapterId, kind: 'skill', label: id, weight: 0.6 })

function buildJourney() {
  return Journey.create({
    chapters: [chapter('a', 0, 'a1'), chapter('b', 1, 'b1')],
    nodes: [node('a1', 'a'), node('a2', 'a'), node('b1', 'b')],
    edges: [Edge.create({ from: 'a1', to: 'b1', strength: 0.8 })],
  })
}

/** A layout that refuses to place one node, to prove the graph copes. */
class PartialLayout implements GraphLayoutService {
  constructor(private readonly skip: string) {}

  place(journey: Journey): readonly NodePlacement[] {
    return journey.nodes
      .filter((n) => n.id !== this.skip)
      .map((n, index) => ({ nodeId: n.id, position: [index, -index, 0] as const }))
  }
}

describe('buildSceneGraph', () => {
  const layout = new HelixGraphLayout()

  it("exposes each node's direct connections, so a highlight can find its neighbourhood", () => {
    const journey = Journey.create({
      chapters: [chapter('a', 0, 'a1')],
      nodes: [node('a1', 'a'), node('a2', 'a'), node('a3', 'a')],
      edges: [
        Edge.create({ from: 'a1', to: 'a2', strength: 0.7 }),
        Edge.create({ from: 'a2', to: 'a3', strength: 0.7 }),
      ],
    })

    const graph = buildSceneGraph(journey, layout)

    // Adjacency runs both ways: pointing at either end lights the same line.
    expect([...(graph.neighbours.get('a1') ?? [])]).toEqual(['a2'])
    expect([...(graph.neighbours.get('a2') ?? [])].sort()).toEqual(['a1', 'a3'])
    expect(graph.neighbours.get('nobody')).toBeUndefined()
  })

  it('records both endpoints on every edge, so an edge knows when it is pointed at', () => {
    const [edge] = buildSceneGraph(buildJourney(), layout).edges

    expect(edge?.fromId).toBe('a1')
    expect(edge?.toId).toBe('b1')
  })

  it('carries every node through with its position and chapter index', () => {
    const graph = buildSceneGraph(buildJourney(), layout)

    expect(graph.nodes.map((n) => n.id)).toEqual(['a1', 'a2', 'b1'])
    expect(graph.nodes.find((n) => n.id === 'b1')?.chapterIndex).toBe(1)
    expect(graph.nodes.every((n) => n.position.every(Number.isFinite))).toBe(true)
  })

  it('resolves each edge into a pair of concrete points', () => {
    const graph = buildSceneGraph(buildJourney(), layout)
    const [edge] = graph.edges

    expect(graph.edges).toHaveLength(1)
    expect(edge?.from).toHaveLength(3)
    expect(edge?.to).toHaveLength(3)
    expect(edge?.strength).toBe(0.8)
  })

  it('dates an edge to the later of its two endpoints', () => {
    // a1 is in chapter 0 and b1 in chapter 1, so the line cannot appear until 1.
    expect(buildSceneGraph(buildJourney(), layout).edges[0]?.chapterIndex).toBe(1)
  })

  it('reports one centre per chapter', () => {
    const graph = buildSceneGraph(buildJourney(), layout)

    expect(graph.chapterCentres).toHaveLength(2)
    expect(graph.chapterCount).toBe(2)
  })

  it('places a chapter centre among its own nodes', () => {
    const graph = buildSceneGraph(buildJourney(), layout)
    const chapterA = graph.nodes.filter((n) => n.chapterIndex === 0)
    const [, centreY] = graph.chapterCentres[0]!

    const heights = chapterA.map((n) => n.position[1])

    expect(centreY).toBeLessThanOrEqual(Math.max(...heights))
    expect(centreY).toBeGreaterThanOrEqual(Math.min(...heights))
  })

  describe('when the layout leaves a node out', () => {
    it('drops that node rather than drawing it at the origin', () => {
      const graph = buildSceneGraph(buildJourney(), new PartialLayout('a2'))

      expect(graph.nodes.map((n) => n.id)).toEqual(['a1', 'b1'])
    })

    it('drops any edge that lost an endpoint with it', () => {
      const graph = buildSceneGraph(buildJourney(), new PartialLayout('b1'))

      expect(graph.edges).toEqual([])
    })

    it('still produces a usable centre for a chapter left with nothing', () => {
      const graph = buildSceneGraph(buildJourney(), new PartialLayout('b1'))

      expect(graph.chapterCentres).toHaveLength(2)
      expect(graph.chapterCentres[1]?.every(Number.isFinite)).toBe(true)
    })
  })
})
