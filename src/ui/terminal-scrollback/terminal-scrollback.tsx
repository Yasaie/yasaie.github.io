import type { ReactElement } from 'react'
import { useAutoScroll } from '@/hooks/use-auto-scroll/use-auto-scroll'
import type { Line } from '@/tty/line/line'
import { ScrollbackLine } from '@/ui/scrollback-line/scrollback-line'

export type TerminalScrollbackProps = {
  readonly lines: readonly Line[]
  readonly asked: number
  readonly onRun: (command: string) => void
}

export const TerminalScrollback = ({
  lines,
  asked,
  onRun,
}: TerminalScrollbackProps): ReactElement => {
  const scroller = useAutoScroll<HTMLDivElement>(lines, asked)

  return (
    <div
      ref={scroller}
      aria-live="polite"
      className="min-h-0 flex-1 overflow-auto px-gutter pt-6 pb-2 [mask-image:linear-gradient(transparent,black_24px,black_calc(100%_-_24px),transparent)]"
    >
      {lines.map((line, position) => (
        <ScrollbackLine key={position} line={line} onRun={onRun} />
      ))}
    </div>
  )
}
