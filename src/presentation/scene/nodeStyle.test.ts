import { describe, expect, it } from 'vitest'
import type { NodeKind } from '@domain/narrative/NarrativeNode'
import { GLOW_EXTENT, glowRadiusOf, NODE_STYLE, radiusOf } from './nodeStyle'

const KINDS = Object.keys(NODE_STYLE) as NodeKind[]

describe('glowRadiusOf', () => {
  it('reaches past the core it surrounds, for every kind', () => {
    for (const kind of KINDS) {
      expect(glowRadiusOf(kind, 0.5)).toBeGreaterThan(radiusOf(kind, 0.5))
    }
  })

  it('extends the core by exactly the glow extent', () => {
    for (const kind of KINDS) {
      expect(glowRadiusOf(kind, 0.5)).toBeCloseTo(radiusOf(kind, 0.5) * GLOW_EXTENT)
    }
  })

  it('keeps the size ordering the palette established', () => {
    // A sprite that ignored weight would flatten identity into skill, and the
    // hierarchy of the network is carried by size as much as by colour.
    expect(glowRadiusOf('identity', 1)).toBeGreaterThan(glowRadiusOf('skill', 1))
    expect(glowRadiusOf('project', 1)).toBeGreaterThan(glowRadiusOf('skill', 1))
  })

  it('grows with weight within a kind', () => {
    expect(glowRadiusOf('skill', 1)).toBeGreaterThan(glowRadiusOf('skill', 0))
  })

  it('stays positive at zero weight so a node is never invisible', () => {
    for (const kind of KINDS) {
      expect(glowRadiusOf(kind, 0)).toBeGreaterThan(0)
    }
  })
})
