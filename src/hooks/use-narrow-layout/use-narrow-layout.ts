import { useMediaQuery } from 'usehooks-ts'

export const wideBreakpointPx = 600

const narrowViewport = `(max-width: ${wideBreakpointPx - 1}px)`

export const useNarrowLayout = (): boolean => useMediaQuery(narrowViewport)
