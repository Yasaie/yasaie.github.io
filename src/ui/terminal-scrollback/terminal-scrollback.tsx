import type { ReactElement } from 'react'
import { useAutoScroll } from '@/hooks/use-auto-scroll/use-auto-scroll'
import type { Line } from '@/tty/line/line'
import { ScrollbackLine } from '@/ui/scrollback-line/scrollback-line'

export type TerminalScrollbackProps = {
  readonly lines: readonly Line[]
}

export const TerminalScrollback = ({ lines }: TerminalScrollbackProps): ReactElement => {
  const scroller = useAutoScroll<HTMLDivElement>(lines)

  return (
    <div
      ref={scroller}
      aria-live="polite"
      className="min-h-0 flex-1 overflow-auto pt-6 pb-2 [mask-image:linear-gradient(transparent,black_32px)]"
    >
      {lines.map((line, position) => (
        <ScrollbackLine key={position} line={line} />
      ))}
    </div>
  )
}
