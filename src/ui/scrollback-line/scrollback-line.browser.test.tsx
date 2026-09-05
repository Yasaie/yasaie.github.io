import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { wideBreakpointPx } from '@/hooks/use-narrow-layout/use-narrow-layout'
import { responsive, row, segment } from '@/tty/line/line'
import { ScrollbackLine } from './scrollback-line'

const line = responsive(row([segment('uptime  ', 'muted'), segment('16 years', 'body')]), [
  row([segment('uptime', 'muted')]),
  row([segment('16 years', 'body')], '2ch'),
])

const screenHeight = 800

const readingAt = async (width: number): Promise<readonly string[]> => {
  await page.viewport(width, screenHeight)
  const { container } = render(<ScrollbackLine line={line} onRun={() => undefined} />)
  return [...container.querySelectorAll('[data-row]')]
    .filter((drawn) => getComputedStyle(drawn).display !== 'none')
    .map((drawn) => drawn.textContent ?? '')
}

describe('a line the terminal can print two ways', () => {
  it('shows the padded reading alone once the screen is wide enough for it', async () => {
    expect(await readingAt(wideBreakpointPx)).toEqual(['uptime  16 years'])
  })

  it('shows the stacked reading alone once the screen is too narrow to pad', async () => {
    expect(await readingAt(wideBreakpointPx - 1)).toEqual(['uptime', '16 years'])
  })
})
