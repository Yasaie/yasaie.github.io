const wideViewportWidth = 1024

type WidthBound = { readonly atLeast: boolean; readonly pixels: number }

const widthQuery = /\((min|max)-width:\s*(\d+)px\)/

const boundOf = (query: string): WidthBound | undefined => {
  const found = widthQuery.exec(query)
  return found === null
    ? undefined
    : { atLeast: found[1] === 'min', pixels: Number(found[2] ?? '0') }
}

const matchesViewport = (query: string): boolean => {
  const bound = boundOf(query)
  if (bound === undefined) return false
  return bound.atLeast ? window.innerWidth >= bound.pixels : window.innerWidth <= bound.pixels
}

const announcers = new Set<() => void>()

const listFor = (query: string): MediaQueryList => {
  const changes = new EventTarget()
  const list = {
    media: query,
    get matches() {
      return matchesViewport(query)
    },
    onchange: null,
    addListener: (listener: EventListener) => changes.addEventListener('change', listener),
    removeListener: (listener: EventListener) => changes.removeEventListener('change', listener),
    addEventListener: (type: string, listener: EventListener) =>
      changes.addEventListener(type, listener),
    removeEventListener: (type: string, listener: EventListener) =>
      changes.removeEventListener(type, listener),
    dispatchEvent: (event: Event) => changes.dispatchEvent(event),
  }
  announcers.add(() => changes.dispatchEvent(new Event('change')))
  return list as unknown as MediaQueryList
}

export const setViewportWidth = (pixels: number): void => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: pixels })
  for (const announce of announcers) announce()
}

export const installViewport = (): void => {
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: listFor })
  announcers.clear()
  setViewportWidth(wideViewportWidth)
}
