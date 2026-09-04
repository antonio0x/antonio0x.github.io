import { Suspense, lazy, useEffect, useState } from 'react'
import type { GraphLayoutService } from '@domain/ports/GraphLayoutService'
import type { Journey } from '@domain/narrative/Journey'
import { useJourneyStore } from '../state/journeyStore'
import { useLocale } from '../i18n/useLocale'

/**
 * The entire 3D stack, behind a dynamic import.
 *
 * Three.js, drei and postprocessing add well over a megabyte. Loading them
 * eagerly would delay the text for every visitor, including the ones who will
 * never see a canvas — a phone on a slow connection, a screen reader, a
 * crawler, anyone with reduced motion turned on. Splitting here means that
 * cost is only paid by the devices that can actually use it.
 */
const Stage = lazy(() => import('./Stage').then((module) => ({ default: module.Stage })))

export interface SceneLayerProps {
  journey: Journey
  layout: GraphLayoutService
}

function useCompactViewport(): boolean {
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const onChange = (event: MediaQueryListEvent) => {
      setCompact(event.matches)
    }

    query.addEventListener('change', onChange)
    return () => {
      query.removeEventListener('change', onChange)
    }
  }, [])

  return compact
}

export function SceneLayer({ journey, layout }: SceneLayerProps) {
  const quality = useJourneyStore((state) => state.quality)
  const compact = useCompactViewport()
  const { t } = useLocale()

  // `static` covers no WebGL and reduced motion alike. Nothing is mounted, so
  // nothing is downloaded either.
  if (quality === 'static') return null

  return (
    <div
      aria-hidden="true"
      role="presentation"
      aria-label={t.graphLabel}
      className="pointer-events-none fixed inset-0 z-0"
    >
      <Suspense fallback={null}>
        <Stage journey={journey} layout={layout} tier={quality} compact={compact} />
      </Suspense>

      {/*
        Reading scrim.

        A network of glowing lines behind body copy is a contrast problem, not
        an aesthetic one. This gradient darkens the side the text occupies —
        the left column on wide screens, the whole viewport on narrow ones —
        so the prose keeps its contrast ratio no matter what the camera is
        flying past behind it.
      */}
      <div className="absolute inset-0 bg-void/78 md:hidden" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-void from-30% via-void/88 via-62% to-transparent md:block" />
    </div>
  )
}
