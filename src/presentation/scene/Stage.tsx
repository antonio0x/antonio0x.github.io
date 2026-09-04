import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import type { GraphLayoutService } from '@domain/ports/GraphLayoutService'
import type { Journey } from '@domain/narrative/Journey'
import { useJourneyStore, type QualityTier } from '../state/journeyStore'
import { PerformanceGuard } from './PerformanceGuard'
import { AmbientField } from './network/AmbientField'
import { DataPackets } from './network/DataPackets'
import { EdgeField } from './network/EdgeField'
import { NodeField } from './network/NodeField'
import { CameraRig } from './rig/CameraRig'
import { BACKGROUND_COLOR, FOG_DENSITY } from './nodeStyle'
import { degrade, QUALITY_PRESETS } from './quality'
import { buildSceneGraph } from './sceneGraph'

export interface StageProps {
  journey: Journey
  layout: GraphLayoutService
  tier: Exclude<QualityTier, 'static'>
  /** Narrow viewports need a wider lens and a closer camera to frame a cluster. */
  compact: boolean
}

export function Stage({ journey, layout, tier, compact }: StageProps) {
  const setQuality = useJourneyStore((state) => state.setQuality)
  const preset = QUALITY_PRESETS[tier]

  const graph = useMemo(() => buildSceneGraph(journey, layout), [journey, layout])

  const depth = useMemo(() => {
    const heights = graph.chapterCentres.map(([, y]) => y)
    return heights.length === 0 ? 40 : Math.abs(Math.min(...heights)) + 20
  }, [graph.chapterCentres])

  return (
    <Canvas
      dpr={[preset.dpr[0], preset.dpr[1]]}
      gl={{
        antialias: preset.antialias,
        powerPreference: 'high-performance',
        // The DOM layer already paints the background; the canvas only adds light.
        alpha: true,
      }}
      camera={{ fov: compact ? 68 : 52, near: 0.1, far: 400 }}
      // The scene is decoration. Pointer events belong to the text on top of it.
      style={{ pointerEvents: 'none' }}
    >
      <fogExp2 attach="fog" args={[BACKGROUND_COLOR, FOG_DENSITY]} />

      {/*
        Frames dropping is not a reason to stutter through the whole visit.
        One step down the ladder, and the store tells the rest of the app.
      */}
      <PerformanceGuard
        onDecline={() => {
          setQuality(degrade(tier))
        }}
      />

      <CameraRig
        chapterCentres={graph.chapterCentres}
        distance={compact ? 32 : 30}
        lateralBias={compact ? 0 : 0.3}
      />

      <NodeField nodes={graph.nodes} chapterCount={graph.chapterCount} />
      <EdgeField edges={graph.edges} chapterCount={graph.chapterCount} />

      {preset.packets && (
        <DataPackets
          edges={graph.edges}
          chapterCount={graph.chapterCount}
          packetsPerEdge={preset.packetsPerEdge}
        />
      )}

      <AmbientField depth={depth} density={preset.ambientDensity} />

      {preset.bloom && (
        <EffectComposer enableNormalPass={false}>
          <Bloom intensity={0.55} luminanceThreshold={0.74} luminanceSmoothing={0.3} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  )
}
