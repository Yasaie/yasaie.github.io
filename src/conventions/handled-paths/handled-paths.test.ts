import { describe, expect, it } from 'vitest'
import { installedApps } from '@/kernel/registry/registry'
import { mountRealDisk } from '@/testing/disk/disk'

const volume = await mountRealDisk()

describe('the documents programs promise to render', () => {
  it('are all on the disk, so no program can be asked for a file that is not there', () => {
    const missing = installedApps
      .flatMap((app) => app.handles)
      .filter((path) => !volume.exists(path))

    expect(missing).toEqual([])
  })

  it('are legible, so a program never renders a file the machine refuses to open', () => {
    const unreadable = installedApps
      .flatMap((app) => app.handles)
      .filter((path) => volume.read(path) === undefined)

    expect(unreadable).toEqual([])
  })

  it('belong to exactly one program each, so two programs never claim the same file', () => {
    const claimed = installedApps.flatMap((app) => app.handles)

    expect(claimed).toHaveLength(new Set(claimed).size)
  })
})
