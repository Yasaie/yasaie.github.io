import { homePath } from '@/fs/path/path'
import type { App } from '@/kernel/contract/contract'
import { introductionLines } from './introduction'

const whoamiPath = `${homePath}/whoami.txt`

export const whoami: App = {
  name: 'whoami',
  aliases: [],
  summary: 'the short version',
  listed: 1,
  counted: true,
  handles: [whoamiPath],
  run: (_invocation, volume) => ({
    lines: introductionLines(volume.require(whoamiPath)),
    effects: [],
  }),
}
