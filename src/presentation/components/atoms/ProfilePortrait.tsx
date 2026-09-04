import type { Portrait } from '@domain/profile/Portrait'

export interface ProfilePortraitProps {
  portrait: Portrait
  /** Rendered size in CSS pixels. The file is served at twice this for retina. */
  size?: number
}

/**
 * The author's photograph.
 *
 * `width` and `height` come from the domain rather than from CSS because they
 * are what lets the browser reserve the box before the bytes arrive. Without
 * them the headline under the portrait jumps once it loads, which is the most
 * common self-inflicted layout shift on a personal site.
 *
 * It is loaded eagerly and at high priority: this sits at the top of the
 * document, so lazy-loading it would delay the one image the visitor is
 * guaranteed to look at.
 */
export function ProfilePortrait({ portrait, size = 112 }: ProfilePortraitProps) {
  return (
    <picture>
      {portrait.webpSrc !== null && <source srcSet={portrait.webpSrc} type="image/webp" />}
      <img
        src={portrait.src}
        alt={portrait.alt}
        width={portrait.width}
        height={portrait.height}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        style={{ width: size, height: size / portrait.aspectRatio }}
        className="rounded-full border border-line-bright object-cover shadow-[0_0_40px_-12px_rgba(45,212,191,0.45)]"
      />
    </picture>
  )
}
