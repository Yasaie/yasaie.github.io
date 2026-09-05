import type { ReactElement } from 'react'
import { useAutoScroll } from '@/hooks/use-auto-scroll/use-auto-scroll'
import { useLineScroll } from '@/hooks/use-line-scroll/use-line-scroll'
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
  useLineScroll(scroller)

  return (
    <div
      ref={scroller}
      aria-label="terminal output"
      aria-live="polite"
      role="log"
      tabIndex={0}
      className="min-h-0 flex-1 overflow-auto overscroll-contain px-gutter pt-6 pb-2 [mask-image:linear-gradient(transparent,black_24px,black_calc(100%_-_24px),transparent)]"
    >
      {lines.map((line, position) => (
        <ScrollbackLine key={position} line={line} onRun={onRun} />
      ))}
    </div>
  )
}
