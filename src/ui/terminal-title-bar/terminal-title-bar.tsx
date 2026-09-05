import type { ReactElement } from 'react'
import { useClock } from '@/hooks/use-clock/use-clock'

const host = 'payam@yasaie.com — zsh'
const zone = 'CET'

export const TerminalTitleBar = (): ReactElement => {
  const time = useClock()

  return (
    <div className="flex justify-between gap-4 pt-6 text-terminal-faint">
      <span className="truncate">{host}</span>
      <span className="whitespace-nowrap">{`${time} ${zone}`}</span>
    </div>
  )
}
