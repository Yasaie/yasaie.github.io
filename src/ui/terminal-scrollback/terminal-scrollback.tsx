import type { ReactElement, ReactNode } from 'react'
import { useAutoScroll } from '@/hooks/use-auto-scroll/use-auto-scroll'
import type { Line } from '@/tty/line/line'
import { ScrollbackLine } from '@/ui/scrollback-line/scrollback-line'

export type TerminalScrollbackProps = {
  readonly lines: readonly Line[]
  readonly children: ReactNode
}

export const TerminalScrollback = ({ lines, children }: TerminalScrollbackProps): ReactElement => {
  const scroller = useAutoScroll<HTMLDivElement>(lines)

  return (
    <div
      ref={scroller}
      className="relative z-10 min-h-0 flex-1 overflow-auto px-gutter pt-6 pb-7 [mask-image:linear-gradient(transparent,black_32px)]"
    >
      <div className="flex max-w-measure flex-col">
        <div aria-live="polite">
          {lines.map((line, position) => (
            <ScrollbackLine key={position} line={line} />
          ))}
        </div>
        {children}
      </div>
    </div>
  )
}
