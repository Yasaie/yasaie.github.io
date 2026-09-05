import type { ReactElement } from 'react'
import { useClock } from '@/hooks/use-clock/use-clock'

const host = 'payam@yasaie · zsh'

export const TerminalTitleBar = (): ReactElement => {
  const time = useClock()

  return (
    <div className="flex shrink-0 justify-between gap-4 border-b border-terminal-faint/20 px-gutter py-3 text-terminal-faint">
      <span className="truncate">{host}</span>
      <span className="whitespace-nowrap">{time}</span>
    </div>
  )
}
