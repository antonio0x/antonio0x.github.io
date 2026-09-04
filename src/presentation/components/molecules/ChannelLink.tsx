import type { ContactChannel } from '@domain/profile/ContactChannel'
import { Icon, type IconName } from '../atoms/Icon'
import { nodeIds } from '@domain/narrative/nodeIds'
import { useNodeLink } from '../../hooks/useNodeLink'
import { SmartLink } from '../atoms/SmartLink'

const ICON: Readonly<Record<ContactChannel['kind'], IconName>> = {
  email: 'mail',
  phone: 'phone',
  github: 'github',
  linkedin: 'linkedin',
  website: 'globe',
  resume: 'download',
}

export function ChannelLink({ channel }: { channel: ContactChannel }) {
  const link = useNodeLink(nodeIds.contact(channel.kind))

  return (
    <li {...link}>
      <SmartLink
        href={channel.href}
        external={channel.isExternal}
        className="flex items-center gap-3 rounded-xl border border-line bg-surface/85 px-5 py-4 text-ink transition-colors duration-200 hover:border-signal-dim hover:bg-raised"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line-bright text-signal">
          <Icon name={ICON[channel.kind]} size={16} />
        </span>
        <span className="truncate">{channel.label}</span>
      </SmartLink>
    </li>
  )
}
