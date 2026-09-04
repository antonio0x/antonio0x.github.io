import { invariant } from '../shared/DomainError'
import { requireText } from '../shared/guards'

export const CHANNEL_KINDS = [
  'email',
  'phone',
  'github',
  'linkedin',
  'website',
  'resume',
] as const

export type ChannelKind = (typeof CHANNEL_KINDS)[number]

/** Every kind knows what a working link to it looks like. */
const HREF_PATTERN: Readonly<Record<ChannelKind, RegExp>> = {
  email: /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^tel:\+?[\d]+$/,
  github: /^https:\/\/(www\.)?github\.com\/.+/,
  linkedin: /^https:\/\/(www\.)?linkedin\.com\/.+/,
  website: /^https?:\/\/.+/,
  resume: /^(https?:\/\/.+|\/.+)$/,
}

export interface ContactChannelProps {
  readonly kind: ChannelKind
  readonly label: string
  readonly href: string
}

export class ContactChannel {
  private constructor(
    readonly kind: ChannelKind,
    readonly label: string,
    readonly href: string,
  ) {
    Object.freeze(this)
  }

  static create(props: ContactChannelProps): ContactChannel {
    const label = requireText(props.label, 'Contact label')
    const href = requireText(props.href, 'Contact href')

    invariant(
      HREF_PATTERN[props.kind].test(href),
      `Contact of kind "${props.kind}" has an href that will not work: "${href}"`,
    )

    return new ContactChannel(props.kind, label, href)
  }

  /** Drives target="_blank" and rel="noreferrer" in the view. */
  get isExternal(): boolean {
    return this.href.startsWith('http')
  }
}
