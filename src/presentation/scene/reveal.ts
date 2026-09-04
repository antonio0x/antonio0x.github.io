/**
 * How far ahead of its own chapter a node starts fading in, measured in
 * chapter slices.
 */
const LEAD_IN = 0.55

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

/**
 * Reveal amount, 0..1, for a node belonging to `chapterIndex`.
 *
 * A chapter's nodes finish appearing exactly as its section starts entering
 * the viewport, and begin `LEAD_IN` slices earlier. Two consequences worth
 * stating: chapter zero is already complete at progress 0, so the hero node is
 * solid on load rather than fading in under the visitor; and every later
 * chapter is in place before its text is centred, so the network anticipates
 * the story instead of chasing it.
 *
 * Pure arithmetic on purpose: the whole build-up can be tuned and verified
 * without rendering a single frame.
 */
export function revealAmount(
  chapterIndex: number,
  chapterCount: number,
  progress: number,
): number {
  if (chapterCount <= 0) return 0

  const slice = 1 / chapterCount
  const end = chapterIndex * slice
  const start = end - LEAD_IN * slice

  if (end <= start) return progress >= start ? 1 : 0

  return clamp01((progress - start) / (end - start))
}

/** Smoothstep. Takes the mechanical edge off a linear reveal. */
export function ease(t: number): number {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

/**
 * Frame-rate independent damping.
 *
 * `lerp(current, target, 0.1)` moves 10% per *frame*, so it is twice as fast
 * at 120fps as at 60. This moves the same fraction per *second*, which is what
 * makes the camera feel identical on a phone and on a gaming monitor.
 */
export function damp(current: number, target: number, lambda: number, delta: number): number {
  return target + (current - target) * Math.exp(-lambda * delta)
}
