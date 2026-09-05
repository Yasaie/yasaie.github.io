import type { ReactElement } from 'react'

export type PromptStatusProps = {
  readonly label: string
}

export const PromptStatus = ({ label }: PromptStatusProps): ReactElement => (
  <span className="whitespace-nowrap text-status text-terminal-faint">{label}</span>
)
