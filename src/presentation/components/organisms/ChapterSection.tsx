import type { ReactNode } from 'react'
import type { Chapter } from '@domain/narrative/Chapter'
import { Eyebrow } from '../atoms/Eyebrow'

export interface ChapterSectionProps {
  chapter: Chapter
  children?: ReactNode
  /** The opening beat gets the full-bleed treatment; the rest share one rhythm. */
  variant?: 'hero' | 'standard'
}

/**
 * The shell every chapter shares.
 *
 * Real <section> with a real heading, so the page outline a screen reader
 * announces is the same story a sighted visitor scrolls through.
 */
export function ChapterSection({ chapter, children, variant = 'standard' }: ChapterSectionProps) {
  const headingId = `chapter-${chapter.id}-title`

  return (
    <section
      id={chapter.id}
      aria-labelledby={headingId}
      data-chapter={chapter.id}
      className={
        variant === 'hero'
          ? 'flex min-h-[100svh] items-center px-6 py-24 sm:px-10 lg:px-16'
          : 'px-6 py-24 sm:px-10 lg:px-16 lg:py-32'
      }
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-2xl">
          <Eyebrow>{chapter.eyebrow}</Eyebrow>

          <h2
            id={headingId}
            className={variant === 'hero' ? 'text-display leading-[0.95]' : 'text-chapter'}
          >
            {chapter.title}
          </h2>

          {chapter.body.length > 0 && (
            <p className="mt-6 text-lg leading-relaxed text-ink-muted">{chapter.body}</p>
          )}
        </div>

        {children}
      </div>
    </section>
  )
}
