import type { ReactElement } from 'react'
import { cn } from '@/lib/cn/cn'
import type { Line, Row } from '@/tty/line/line'
import { LineSegment } from '@/ui/line-segment/line-segment'

type LineOf<Kind extends Line['kind']> = Extract<Line, { readonly kind: Kind }>

type Renderers = {
  readonly [Kind in Line['kind']]: (line: LineOf<Kind>) => ReactElement
}

type SegmentRowProps = {
  readonly row: Row
  readonly className?: string
}

const wideOnly = 'hidden min-[600px]:block'
const narrowOnly = 'min-[600px]:hidden'

const SegmentRow = ({ row, className }: SegmentRowProps): ReactElement => (
  <div
    className={cn('whitespace-pre-wrap pb-[2px] [overflow-wrap:anywhere]', className)}
    style={{ paddingLeft: row.indent }}
  >
    {row.segments.map((part, column) => (
      <LineSegment key={column} segment={part} />
    ))}
  </div>
)

const renderers: Renderers = Object.freeze({
  plain: (line) => <SegmentRow row={line.row} />,
  responsive: (line) => (
    <>
      <SegmentRow row={line.wide} className={wideOnly} />
      {line.narrow.map((stacked, position) => (
        <SegmentRow key={position} row={stacked} className={narrowOnly} />
      ))}
    </>
  ),
  wordmark: (line) => (
    <div className="whitespace-pre pb-0 font-wordmark text-[6.5px] leading-none tracking-[0] min-[421px]:text-[9px] min-[721px]:text-[13px]">
      <span className="inline-block align-top text-terminal-accent">{line.text}</span>
    </div>
  ),
})

const render = <Kind extends Line['kind']>(kind: Kind, line: LineOf<Kind>): ReactElement =>
  renderers[kind](line)

export type ScrollbackLineProps = {
  readonly line: Line
}

export const ScrollbackLine = ({ line }: ScrollbackLineProps): ReactElement =>
  render(line.kind, line)
