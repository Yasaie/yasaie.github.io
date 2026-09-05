import { describe, expect, it } from 'vitest'
import { filesIn, foldersIn } from '#tests/helpers/tree'

const appFolders = foldersIn('src/apps')

const missing = (wanted: (folder: string) => string): readonly string[] =>
  appFolders.filter((folder) => !filesIn(`src/apps/${folder}`).includes(wanted(folder)))

describe('every installed app', () => {
  it('is a folder, so adding one installs a program and deleting one uninstalls it', () => {
    expect(appFolders.length).toBeGreaterThan(0)
  })

  it('holds a module named after its folder, which is the only module the kernel loads', () => {
    expect(missing((folder) => `${folder}.ts`)).toEqual([])
  })

  it('holds a test beside that module, so no program ships unexercised', () => {
    expect(missing((folder) => `${folder}.test.ts`)).toEqual([])
  })

  it('holds nothing but its own modules and their tests', () => {
    const stray = appFolders.flatMap((folder) =>
      filesIn(`src/apps/${folder}`)
        .filter((file) => !/\.tsx?$/.test(file))
        .map((file) => `${folder}/${file}`),
    )
    expect(stray).toEqual([])
  })
})
