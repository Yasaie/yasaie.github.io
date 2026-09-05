import type { ReactElement } from 'react'
import { useAutoScroll } from '@/hooks/use-auto-scroll/use-auto-scroll'
import type { Line } from '@/tty/line/line'
import { ScrollbackLine } from '@/ui/scrollback-line/scrollback-line'

const fade = '[mask-image:linear-gradient(transparent,black_32px)]'

export type TerminalScrollbackProps = {
  readonly lines: readonly Line[]
}

export const TerminalScrollback = ({ lines }: TerminalScrollbackProps): ReactElement => {
  const scroller = useAutoScroll<HTMLDivElement>(lines)

  return (
    <div
      ref={scroller}
      aria-live="polite"
      className={`relative z-[2] min-h-0 flex-1 overflow-auto px-[clamp(20px,4vw,40px)] pt-[24px] pb-[8px] ${fade}`}
    >
      <div className="flex max-w-[960px] flex-col">
        {lines.map((line, position) => (
          <ScrollbackLine key={position} line={line} />
        ))}
      </div>
    </div>
  )
}
