import type { App, Output } from '@/kernel/contract/contract'
import { blank, text } from '@/tty/line/line'

const shutdownSpeedMs = 120
const powerOffDelayMs = 1400

const goingDown = Object.freeze({
  lines: [
    text('broadcast message: the system is going down for reboot now', 'body'),
    blank,
    text('[  ok  ] stopped nothing in particular', 'muted'),
    text('[  ok  ] unmounted sixteen years', 'muted'),
    text('[  ok  ] reached target power-off', 'muted'),
  ],
  effects: [{ kind: 'reboot', delayMs: powerOffDelayMs }],
  speedMs: shutdownSpeedMs,
} satisfies Output)

export const reboot: App = {
  name: 'reboot',
  aliases: ['restart', 'shutdown'],
  summary: 'you know what this does',
  listed: null,
  counted: false,
  handles: [],
  run: () => goingDown,
}
