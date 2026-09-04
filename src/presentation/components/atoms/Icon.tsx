/**
 * The icon set.
 *
 * Drawn, not typed. The previous version reached into Unicode for ✉, ☎ and ⌥,
 * which is not an icon system: those glyphs come from whichever font happens to
 * resolve them, so their stroke weight, optical size and alignment are decided
 * by the reader's machine rather than by this design. On Linux ⌥ frequently
 * falls back to a symbol font that shares nothing with the rest of the page.
 *
 * Every icon here is authored on the same 24x24 grid with a 1.6 stroke, round
 * caps and round joins, and inherits its colour from the text around it.
 */

/** Path geometry only; every shared attribute lives on the <svg> below. */
const PATHS = {
  mail: 'M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5v-9Z M3.6 7.2 12 13.2l8.4-6',
  phone:
    'M6.2 3.8h3l1.4 3.6-2 1.4a11.4 11.4 0 0 0 5.6 5.6l1.4-2 3.6 1.4v3a1.6 1.6 0 0 1-1.8 1.6C10.6 18 6 13.4 4.6 5.6a1.6 1.6 0 0 1 1.6-1.8Z',
  github:
    'M9.4 20.4v-2.9c-3 .6-3.7-1.4-3.7-1.4-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.4-.3-4.9-1.2-4.9-5.4 0-1.2.4-2.2 1.1-2.9-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 1.1a10.3 10.3 0 0 1 5.4 0c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.6.1 2.9.7.7 1.1 1.7 1.1 2.9 0 4.2-2.5 5.1-4.9 5.4.4.3.8 1 .8 2.1v3.1',
  linkedin: 'M6.5 9.5v9 M6.5 5.6v.1 M11 18.5v-9 M11 13.2c0-2 1.2-3.1 2.8-3.1 1.6 0 2.7 1 2.7 3.2v5.2',
  globe: 'M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 0 0 0-17.6Z M3.4 12h17.2 M12 3.2c2.2 2.4 3.3 5.4 3.3 8.8s-1.1 6.4-3.3 8.8c-2.2-2.4-3.3-5.4-3.3-8.8S9.8 5.6 12 3.2Z',
  download: 'M12 4v11 M7.5 10.6 12 15.1l4.5-4.5 M4.5 19.5h15',
  repository: 'M12 3.4 20.1 8v8L12 20.6 3.9 16V8l8.1-4.6Z M3.9 8l8.1 4.6L20.1 8 M12 12.6v8',
  arrowDown: 'M12 4.5v14 M6.5 13 12 18.5 18.5 13',
} as const satisfies Readonly<Record<string, string>>

export type IconName = keyof typeof PATHS

export interface IconProps {
  name: IconName
  /** Matches the surrounding text size by default; pass a number for a fixed box. */
  size?: number
  className?: string
}

/**
 * Decorative by default. An icon that repeats a visible label adds nothing for
 * a screen reader, so it is hidden unless a caller gives it a title.
 */
export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
