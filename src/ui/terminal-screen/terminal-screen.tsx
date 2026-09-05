import type { ReactElement } from 'react'
import type { Volume } from '@/fs/volume/volume'
import { useClickToFocus } from '@/hooks/use-click-to-focus/use-click-to-focus'
import { useTerminal } from '@/hooks/use-terminal/use-terminal'
import { useTypeToFocus } from '@/hooks/use-type-to-focus/use-type-to-focus'
import { submitted, typed } from '@/session/actions/actions'
import { TerminalBackdrop } from '@/ui/terminal-backdrop/terminal-backdrop'
import { TerminalPrompt } from '@/ui/terminal-prompt/terminal-prompt'
import { TerminalScrollback } from '@/ui/terminal-scrollback/terminal-scrollback'
import { TerminalTitleBar } from '@/ui/terminal-title-bar/terminal-title-bar'

const desktop =
  'fixed inset-0 flex items-center justify-center overflow-hidden bg-terminal-bg font-mono text-screen leading-relaxed text-terminal-text wide:p-8'

const shell =
  'relative z-10 flex h-full min-h-0 w-full flex-col overflow-hidden border-terminal-faint/30 bg-terminal-bg/80 wide:max-h-[880px] wide:max-w-[1280px] wide:rounded-lg wide:border wide:shadow-[0_24px_80px_-12px_rgb(0_0_0/0.9)]'

export type TerminalScreenProps = {
  readonly volume: Volume
}

export const TerminalScreen = ({ volume }: TerminalScreenProps): ReactElement => {
  const terminal = useTerminal(volume)
  const run = (command: string): void => {
    terminal.dispatch(typed(command, command.length))
    terminal.dispatch(submitted())
  }
  const input = useTypeToFocus<HTMLInputElement>()
  useClickToFocus(input)

  return (
    <div className={desktop}>
      <TerminalBackdrop />
      <div className={shell}>
        <TerminalTitleBar />
        <TerminalScrollback
          lines={terminal.state.lines}
          asked={terminal.state.history.length}
          onRun={run}
        />
        <TerminalPrompt terminal={terminal} inputRef={input} />
      </div>
    </div>
  )
}
