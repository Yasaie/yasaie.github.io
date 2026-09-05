import type { ReactElement } from 'react'
import { useVolume } from '@/hooks/use-volume/use-volume'
import { TerminalScreen } from '@/ui/terminal-screen/terminal-screen'

const mountFailure = 'mount: /'

export const App = (): ReactElement | null => {
  const disk = useVolume()

  switch (disk.status) {
    case 'mounting':
      return null
    case 'ready':
      return <TerminalScreen volume={disk.volume} />
    case 'failed':
      return (
        <p className="fixed inset-0 bg-terminal-bg px-gutter pt-6 font-mono text-screen leading-relaxed text-terminal-muted">
          {`${mountFailure}: ${disk.failure}`}
        </p>
      )
  }
}
