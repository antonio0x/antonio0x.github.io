import { useEffect, type RefObject } from 'react'
import { createScrollDirector, refreshScrollDirector } from '../motion/scrollDirector'
import { useJourneyStore } from '../state/journeyStore'

/**
 * Wires the scroll director to the store for as long as the page is mounted.
 *
 * `chaptersKey` exists so switching language — which rewrites every section and
 * therefore changes their heights — forces the triggers to be rebuilt instead
 * of leaving them measuring a layout that no longer exists.
 */
export function useScrollDirector(
  mainRef: RefObject<HTMLElement | null>,
  chaptersKey: string,
): void {
  const setProgress = useJourneyStore((state) => state.setProgress)
  const setActiveChapter = useJourneyStore((state) => state.setActiveChapter)

  useEffect(() => {
    const trigger = mainRef.current
    if (trigger === null) return

    const dispose = createScrollDirector({
      trigger,
      onProgress: setProgress,
      onChapterChange: setActiveChapter,
    })

    // Web fonts and late layout shifts settle after the first paint.
    const settle = window.setTimeout(refreshScrollDirector, 120)

    return () => {
      window.clearTimeout(settle)
      dispose()
    }
  }, [mainRef, chaptersKey, setProgress, setActiveChapter])
}
