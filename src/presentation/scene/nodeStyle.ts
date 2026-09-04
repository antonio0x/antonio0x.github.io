import type { NodeKind } from '@domain/narrative/NarrativeNode'

export interface NodeStyle {
  /** Linear-space colour. Values above 1 push the node past the bloom threshold. */
  readonly color: readonly [number, number, number]
  /** Base radius before the node's own weight is applied. */
  readonly baseRadius: number
  readonly weightInfluence: number
}

/**
 * How each kind of node looks.
 *
 * Colour magnitudes sit a little above 1 rather than far above it. Push them
 * higher and bloom blows every core out to the same white, which throws away
 * the only thing the palette was for: telling a skill from a project at a
 * glance. The glow should surround the colour, not replace it.
 *
 * The palette is deliberately narrow: teal is the network itself, amber is
 * work someone paid for or published, white is the person. Three meanings, so
 * the colours stay readable instead of becoming decoration.
 *
 * `setup` sits inside the teal meaning rather than claiming a fourth colour —
 * the configured environment is tooling, a sibling of `skill`, and giving it
 * its own hue would have spent the palette's clarity on a distinction the
 * visitor does not need to make at a glance.
 */
export const NODE_STYLE: Readonly<Record<NodeKind, NodeStyle>> = {
  identity: { color: [1.55, 1.75, 1.8], baseRadius: 0.5, weightInfluence: 0.34 },
  milestone: { color: [0.22, 1.2, 1.0], baseRadius: 0.26, weightInfluence: 0.34 },
  role: { color: [1.45, 0.8, 0.34], baseRadius: 0.3, weightInfluence: 0.34 },
  skill: { color: [0.18, 0.92, 0.78], baseRadius: 0.18, weightInfluence: 0.4 },
  setup: { color: [0.12, 0.86, 0.58], baseRadius: 0.2, weightInfluence: 0.36 },
  project: { color: [1.6, 0.92, 0.44], baseRadius: 0.32, weightInfluence: 0.36 },
  horizon: { color: [0.4, 1.0, 1.5], baseRadius: 0.25, weightInfluence: 0.32 },
  contact: { color: [1.25, 1.45, 1.55], baseRadius: 0.26, weightInfluence: 0.3 },
}

export function radiusOf(kind: NodeKind, weight: number): number {
  const style = NODE_STYLE[kind]
  return style.baseRadius + weight * style.weightInfluence
}

/** The line colour, dimmed by how strong the connection is. */
export const EDGE_COLOR = [0.055, 0.34, 0.3] as const
export const BACKGROUND_COLOR = 0x04060b

/**
 * Shared by the scene's fog and the node shader.
 *
 * The nodes blend additively, so they cannot use Three's fog chunks and have
 * to reproduce the same falloff themselves. Two copies of this number that
 * drift apart would make nodes recede at a different rate from everything
 * around them, so there is one.
 */
export const FOG_DENSITY = 0.0125

/**
 * How far a node's halo reaches past the solid core it replaces.
 *
 * Nodes are drawn as additive glow sprites rather than lit geometry, so the
 * quad has to be considerably larger than the radius the old sphere occupied:
 * the visible core sits in the middle of the falloff, and the rest of the quad
 * is the light bleeding out of it. Too small and the glow clips into a square;
 * too large and neighbouring halos merge into fog.
 */
export const GLOW_EXTENT = 2.5

/** The radius of the sprite that carries a node's glow, halo included. */
export function glowRadiusOf(kind: NodeKind, weight: number): number {
  return radiusOf(kind, weight) * GLOW_EXTENT
}
