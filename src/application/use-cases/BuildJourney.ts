import { Chapter } from '@domain/narrative/Chapter'
import { CHAPTER_IDS, type ChapterId } from '@domain/narrative/chapterIds'
import { Edge } from '@domain/narrative/Edge'
import { Journey } from '@domain/narrative/Journey'
import { NarrativeNode } from '@domain/narrative/NarrativeNode'
import type { ChapterCopy } from '@domain/ports/JourneyCopyRepository'
import type { Profile } from '@domain/profile/Profile'
import type { Project } from '@domain/projects/Project'
import { Project as ProjectEntity } from '@domain/projects/Project'
import { invariant } from '@domain/shared/DomainError'

export interface BuildJourneyInput {
  readonly profile: Profile
  readonly projects: readonly Project[]
  readonly copy: readonly ChapterCopy[]
}

/** Node id namespaces, so a skill and a project can never collide on a bare id. */
const nodeId = {
  identity: () => 'identity:root',
  education: (id: string) => `education:${id}`,
  certification: (id: string) => `cert:${id}`,
  role: (id: string) => `role:${id}`,
  skill: (id: string) => `skill:${id}`,
  setup: (id: string) => `setup:${id}`,
  project: (id: string) => `project:${id}`,
  horizon: (id: string) => `horizon:${id}`,
  contact: (kind: string) => `contact:${kind}`,
} as const

function nodesForChapter(
  chapterId: ChapterId,
  profile: Profile,
  projects: readonly Project[],
): NarrativeNode[] {
  switch (chapterId) {
    case 'intro':
      return [
        NarrativeNode.create({
          id: nodeId.identity(),
          chapterId,
          kind: 'identity',
          label: profile.displayName,
          weight: 1,
        }),
      ]

    case 'origin':
      return profile.education
        .filter((education) => !education.isOngoing)
        .map((education) =>
          NarrativeNode.create({
            id: nodeId.education(education.id),
            chapterId,
            kind: 'milestone',
            label: education.program,
            weight: 0.9,
          }),
        )

    case 'foundations':
      return profile.certifications.map((certification) =>
        NarrativeNode.create({
          id: nodeId.certification(certification.id),
          chapterId,
          kind: 'milestone',
          label: certification.name,
          weight: 0.5,
        }),
      )

    case 'craft':
      return profile.experiences.map((experience) =>
        NarrativeNode.create({
          id: nodeId.role(experience.id),
          chapterId,
          kind: 'role',
          label: experience.organization,
          weight: 0.85,
        }),
      )

    case 'stack':
      return profile.skills.map((skill) =>
        NarrativeNode.create({
          id: nodeId.skill(skill.id),
          chapterId,
          kind: 'skill',
          label: skill.name,
          weight: skill.weight,
        }),
      )

    case 'workshop':
      return profile.setup.map((item) =>
        NarrativeNode.create({
          id: nodeId.setup(item.id),
          chapterId,
          kind: 'setup',
          label: item.name,
          weight: 0.55,
        }),
      )

    case 'work':
      return [...projects]
        .sort(ProjectEntity.byPromise)
        .map((project) =>
          NarrativeNode.create({
            id: nodeId.project(project.id),
            chapterId,
            kind: 'project',
            label: project.name,
            weight: project.featured ? 1 : 0.7,
          }),
        )

    case 'horizon':
      return profile.education
        .filter((education) => education.isOngoing)
        .map((education) =>
          NarrativeNode.create({
            id: nodeId.horizon(education.id),
            chapterId,
            kind: 'horizon',
            label: education.program,
            weight: 0.6,
          }),
        )

    case 'contact':
      return profile.channels.map((channel) =>
        NarrativeNode.create({
          id: nodeId.contact(channel.kind),
          chapterId,
          kind: 'contact',
          label: channel.label,
          weight: 0.8,
        }),
      )
  }
}

/**
 * Collects edges while collapsing duplicates.
 *
 * A role and a project can both point at the same skill from opposite
 * directions; the graph should still draw one line, not two on top of
 * each other fighting over the same pixels.
 */
class EdgeSet {
  private readonly seen = new Set<string>()
  private readonly edges: Edge[] = []

  add(from: string, to: string, strength: number): void {
    if (from === to) return

    const key = [from, to].sort().join('|')
    if (this.seen.has(key)) return

    this.seen.add(key)
    this.edges.push(Edge.create({ from, to, strength }))
  }

  toArray(): readonly Edge[] {
    return this.edges
  }
}

/**
 * Turns a CV into a story graph.
 *
 * This is the one place that knows how a life maps onto the network: which
 * chapter a certification belongs to, what connects to what, and what happens
 * when a section of the CV is simply empty. Keeping it in a use case rather
 * than in a React component means the whole mapping is testable in
 * milliseconds, with no browser and no WebGL context.
 */
export function buildJourney({ profile, projects, copy }: BuildJourneyInput): Journey {
  for (const project of projects) {
    for (const skillId of project.skillIds) {
      invariant(
        profile.skillById(skillId) !== null,
        `Project "${project.id}" cites unknown skill "${skillId}"`,
      )
    }
  }

  const copyById = new Map(copy.map((entry) => [entry.id, entry]))

  // A chapter with nothing to show is not rendered at all. Shipping an empty
  // beat would break the rhythm of the story far worse than skipping it.
  const populated = CHAPTER_IDS.map((id) => ({
    id,
    nodes: nodesForChapter(id, profile, projects),
  })).filter((entry) => entry.nodes.length > 0)

  const chapters = populated.map(({ id, nodes }, index) => {
    const text = copyById.get(id)
    invariant(text !== undefined, `Chapter "${id}" has content but no copy for this locale`)

    return Chapter.create({
      id,
      index,
      title: text.title,
      body: text.body,
      focusNodeId: nodes[0]?.id ?? null,
    })
  })

  const edges = new EdgeSet()

  // The spine: every chapter fans out from its own anchor, and the anchors
  // chain together so the whole story reads as one continuous network.
  populated.forEach(({ nodes }, index) => {
    const anchor = nodes[0]
    if (anchor === undefined) return

    for (const node of nodes.slice(1)) {
      edges.add(anchor.id, node.id, 0.35)
    }

    const nextAnchor = populated[index + 1]?.nodes[0]
    if (nextAnchor !== undefined) {
      edges.add(anchor.id, nextAnchor.id, 0.9)
    }
  })

  // The meaning: what was actually used where.
  for (const experience of profile.experiences) {
    for (const skillId of experience.skillIds) {
      edges.add(nodeId.role(experience.id), nodeId.skill(skillId), 0.75)
    }
  }

  for (const project of projects) {
    for (const skillId of project.skillIds) {
      edges.add(nodeId.project(project.id), nodeId.skill(skillId), 0.6)
    }
  }

  return Journey.create({
    chapters,
    nodes: populated.flatMap((entry) => entry.nodes),
    edges: edges.toArray(),
  })
}
