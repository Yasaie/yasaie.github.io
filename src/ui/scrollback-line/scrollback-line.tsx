import type { ReactElement } from 'react'
import { cn } from '@/lib/cn/cn'
import type { Line, Row } from '@/tty/line/line'
import { LineSegment } from '@/ui/line-segment/line-segment'

type LineOf<Kind extends Line['kind']> = Extract<Line, { readonly kind: Kind }>

const block = '█'

const blocksAndShadow = (art: string): readonly string[] =>
  art.split(/(█+)/).filter((run) => run !== '')

type Renderers = {
  readonly [Kind in Line['kind']]: (line: LineOf<Kind>) => ReactElement
}

type SegmentRowProps = {
  readonly row: Row
  readonly className?: string
}

const SegmentRow = ({ row, className }: SegmentRowProps): ReactElement => (
  <div
    className={cn('min-h-[1lh] whitespace-pre-wrap wrap-anywhere pb-0.5', className)}
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
      <SegmentRow row={line.wide} className="hidden wide:block" />
      {line.narrow.map((stacked, position) => (
        <SegmentRow key={position} row={stacked} className="wide:hidden" />
      ))}
    </>
  ),
  wordmark: (line) => (
    <div className="font-wordmark text-wordmark leading-none whitespace-pre">
      {blocksAndShadow(line.text).map((run, at) => (
        <span
          key={at}
          className={cn(
            'inline-block align-top',
            run.startsWith(block) ? 'text-terminal-accent' : 'text-terminal-accent/40',
          )}
        >
          {run}
        </span>
      ))}
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
