/**
 * The beats of the story, in the order they are told.
 *
 * Shared by the copy files and the journey builder so a renamed chapter breaks
 * the type check instead of silently rendering an empty section.
 */
export const CHAPTER_IDS = [
  'intro',
  'origin',
  'foundations',
  'craft',
  'stack',
  'workshop',
  'work',
  'horizon',
  'contact',
] as const

export type ChapterId = (typeof CHAPTER_IDS)[number]
