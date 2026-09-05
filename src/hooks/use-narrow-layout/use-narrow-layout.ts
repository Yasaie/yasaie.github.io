import { useMediaQuery } from 'usehooks-ts'

const narrowViewport = '(max-width: 599px)'

export const useNarrowLayout = (): boolean => useMediaQuery(narrowViewport)
