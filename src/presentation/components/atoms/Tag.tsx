import type { ReactNode } from 'react'

export type TagTone = 'neutral' | 'signal' | 'ember'

const TONE_CLASS: Readonly<Record<TagTone, string>> = {
  neutral: 'border-line text-ink-muted',
  signal: 'border-signal-dim text-signal',
  ember: 'border-ember/40 text-ember',
}

/** Small inline label. Used for stacks, work modes and status. */
export function Tag({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: TagTone
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 label text-[0.7rem] ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  )
}
