import { describe, expect, it } from 'vitest'
import { diskFiles, mountRealDisk } from '#tests/helpers/disk'

const volume = await mountRealDisk()

const hidden = (path: string): boolean => path.split('/').some((segment) => segment.startsWith('.'))

const readAtBoot = diskFiles.filter((path) => volume.read(path) !== undefined)

describe('the documents the machine reads into memory when it boots', () => {
  it('has documents to check, so the convention is not passing on an empty disk', () => {
    expect(readAtBoot.length).toBeGreaterThan(0)
  })

  it('are all at paths a static host will hand out, which no hidden path is', () => {
    expect(readAtBoot.filter(hidden)).toEqual([])
  })

  it('leaves the hidden ones unread, so the disk can still carry what it cannot open', () => {
    expect(diskFiles.filter(hidden)).toEqual(['/home/payam/eindhoven/.secrets'])
  })
})
