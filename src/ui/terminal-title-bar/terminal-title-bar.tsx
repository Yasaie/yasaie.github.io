import type { ReactElement } from 'react'
import { useClock } from '@/hooks/use-clock/use-clock'

const host = 'payam@yasaie.com — zsh'
const zone = 'CET'

export const TerminalTitleBar = (): ReactElement => {
  const time = useClock()

  return (
    <div className="relative z-10 flex justify-between px-gutter pt-6 text-xs text-terminal-faint">
      <span>{host}</span>
      <span>{`${time} ${zone}`}</span>
    </div>
  )
}
