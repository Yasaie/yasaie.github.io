import type { ReactElement } from 'react'
import type { Segment } from '@/tty/line/line'
import { colourClass } from '@/tty/palette/palette'

export type LineSegmentProps = {
  readonly segment: Segment
}

export const LineSegment = ({ segment }: LineSegmentProps): ReactElement => (
  <span className={colourClass[segment.colour]}>{segment.text}</span>
)
