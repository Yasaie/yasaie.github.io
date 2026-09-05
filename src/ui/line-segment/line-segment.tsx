import type { ReactElement } from 'react'
import { useFollowKey } from '@/hooks/use-follow-key/use-follow-key'
import type { Segment } from '@/tty/line/line'
import { colourClass } from '@/tty/palette/palette'
import { cn } from '@/ui/cn/cn'

export type LineSegmentProps = {
  readonly segment: Segment
}

type LinkSegmentProps = {
  readonly segment: Segment & { readonly href: string }
}

const LinkSegment = ({ segment }: LinkSegmentProps): ReactElement => {
  const following = useFollowKey()
  return (
    <a
      className={cn(
        colourClass[segment.colour],
        'no-underline',
        following ? 'cursor-pointer hover:underline' : 'cursor-text',
      )}
      {...(following ? { href: segment.href, target: '_blank', rel: 'noreferrer' } : {})}
    >
      {segment.text}
    </a>
  )
}

export const LineSegment = ({ segment }: LineSegmentProps): ReactElement =>
  segment.href === undefined ? (
    <span className={colourClass[segment.colour]}>{segment.text}</span>
  ) : (
    <LinkSegment segment={{ ...segment, href: segment.href }} />
  )
