import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface ScrollDirectorOptions {
  /** The element whose scroll range maps onto 0..1. Normally <main>. */
  readonly trigger: HTMLElement
  readonly onProgress: (progress: number) => void
  readonly onChapterChange: (chapterId: string | null) => void
}

/**
 * The only ScrollTrigger in the application.
 *
 * It animates exactly one thing: a number. Nothing here touches a camera, a
 * mesh or a material — the scene subscribes to `progress` and does its own
 * interpolation inside useFrame.
 *
 * That separation is not stylistic. GSAP and R3F both want to own the render
 * loop, and the moment two libraries write to the same `position.x` you get
 * jitter that only reproduces on someone else's machine. One writer, one
 * scalar, no contention.
 *
 * Returns a cleanup that kills every trigger it created.
 */
export function createScrollDirector({
  trigger,
  onProgress,
  onChapterChange,
}: ScrollDirectorOptions): () => void {
  const triggers: ScrollTrigger[] = []

  triggers.push(
    ScrollTrigger.create({
      trigger,
      start: 'top top',
      end: 'bottom bottom',
      // A little smoothing so a trackpad flick does not snap the camera.
      scrub: 0.6,
      onUpdate: (self) => {
        onProgress(self.progress)
      },
    }),
  )

  // Chapter changes are driven by what is actually on screen rather than by
  // slicing the progress range, so the text and the camera agree even when a
  // section ends up taller or shorter than its neighbours.
  for (const section of trigger.querySelectorAll<HTMLElement>('[data-chapter]')) {
    const chapterId = section.dataset['chapter'] ?? null

    triggers.push(
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
          onChapterChange(chapterId)
        },
        onEnterBack: () => {
          onChapterChange(chapterId)
        },
      }),
    )
  }

  return () => {
    for (const instance of triggers) {
      instance.kill()
    }
  }
}

/** Recomputes trigger positions after the layout changes (fonts, images, locale). */
export function refreshScrollDirector(): void {
  ScrollTrigger.refresh()
}
