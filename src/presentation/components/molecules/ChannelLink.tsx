import type { ContactChannel } from '@domain/profile/ContactChannel'
import { SmartLink } from '../atoms/SmartLink'

const ICON: Readonly<Record<ContactChannel['kind'], string>> = {
  email: '✉',
  phone: '☎',
  github: '⌥',
  linkedin: 'in',
  website: '◎',
  resume: '↓',
}

export function ChannelLink({ channel }: { channel: ContactChannel }) {
  return (
    <li>
      <SmartLink
        href={channel.href}
        external={channel.isExternal}
        className="flex items-center gap-3 rounded-xl border border-line bg-surface/85 px-5 py-4 text-ink transition-colors duration-200 hover:border-signal-dim hover:bg-raised"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line-bright font-mono text-sm text-signal"
        >
          {ICON[channel.kind]}
        </span>
        <span className="truncate">{channel.label}</span>
      </SmartLink>
    </li>
  )
}
