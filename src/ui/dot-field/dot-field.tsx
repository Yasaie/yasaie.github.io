import type { ReactElement } from 'react'
import { useDotField } from '@/hooks/use-dot-field/use-dot-field'

export const DotField = (): ReactElement => (
  <canvas
    ref={useDotField()}
    className="pointer-events-none absolute inset-0 h-full w-full motion-reduce:hidden"
  />
)
