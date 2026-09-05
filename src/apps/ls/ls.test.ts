import { statSync } from 'node:fs'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mountRealDisk } from '#tests/helpers/disk'
import { invocation } from '#tests/helpers/invocation'
import { coloursOf, textOf } from '#tests/helpers/rows'
import { ls } from '@/apps/ls/ls'
import { nodeSource } from '@/fs/node-source/node-source'
import { mount } from '@/fs/volume/volume'
import { execute } from '@/kernel/execute/execute'

const volume = await mountRealDisk()

const bytesOf = (path: string): number => statSync(join('disk', path)).size

const home = '/home/payam/eindhoven'

const sized = (path: string, width: number): string => String(bytesOf(path)).padStart(width)

const chapterRow = (name: string, year: string): string =>
  `-rw-r--r--  1 payam yasaie ${sized(`${home}/work/${name}`, 3)} ${year}  ${name}`

describe('ls', () => {
  it('names what is in the home directory in the order it was written, not alphabetically', () => {
    const listing = ls.run(invocation('ls'), volume)
    expect(textOf(listing)).toEqual(['whoami.txt  work/  stack.txt  contact.txt'])
    expect(coloursOf(listing)).toEqual([['body']])
    expect(listing.effects).toEqual([])
  })

  it('shows the current and parent directories and the sealed file only when asked for all', () => {
    expect(textOf(ls.run(invocation('ls -a'), volume))).toEqual([
      './  ../  .secrets  whoami.txt  work/  stack.txt  contact.txt',
    ])
  })

  it('reports the real size and date of every file in the long format', () => {
    expect(textOf(ls.run(invocation('ls -l'), volume))).toEqual([
      'total 4',
      `-rw-r--r--  1 payam yasaie ${sized(`${home}/whoami.txt`, 4)} 2010  whoami.txt`,
      'drwxr-xr-x  1 payam yasaie 4096 2024  work/',
      `-rw-r--r--  1 payam yasaie ${sized(`${home}/stack.txt`, 4)} 2026  stack.txt`,
      `-rw-r--r--  1 payam yasaie ${sized(`${home}/contact.txt`, 4)} 2026  contact.txt`,
    ])
  })

  it('picks directories out in accent and sealed entries in muted', () => {
    expect(coloursOf(ls.run(invocation('ls -la'), volume))).toEqual([
      ['muted'],
      ['accent'],
      ['accent'],
      ['muted'],
      ['body'],
      ['accent'],
      ['body'],
      ['body'],
    ])
  })

  it('admits how large the sealed file is and who may not read it', () => {
    expect(textOf(ls.run(invocation('ls -la'), volume))).toEqual([
      'total 7',
      'drwxr-xr-x  1 payam yasaie    4096 2010  ./',
      'd---------  1 root  root      4096 1993  ../',
      '-r--------  1 payam yasaie 2040832 2010  .secrets',
      `-rw-r--r--  1 payam yasaie ${sized(`${home}/whoami.txt`, 7)} 2010  whoami.txt`,
      'drwxr-xr-x  1 payam yasaie    4096 2024  work/',
      `-rw-r--r--  1 payam yasaie ${sized(`${home}/stack.txt`, 7)} 2026  stack.txt`,
      `-rw-r--r--  1 payam yasaie ${sized(`${home}/contact.txt`, 7)} 2026  contact.txt`,
    ])
  })

  it('rounds sizes for a human reader when the flags are run together', () => {
    expect(textOf(ls.run(invocation('ls -hal'), volume))).toEqual([
      'total 7',
      'drwxr-xr-x  1 payam yasaie   4K 2010  ./',
      'd---------  1 root  root     4K 1993  ../',
      '-r--------  1 payam yasaie 1.9M 2010  .secrets',
      `-rw-r--r--  1 payam yasaie ${sized(`${home}/whoami.txt`, 4)} 2010  whoami.txt`,
      'drwxr-xr-x  1 payam yasaie   4K 2024  work/',
      `-rw-r--r--  1 payam yasaie ${sized(`${home}/stack.txt`, 4)} 2026  stack.txt`,
      `-rw-r--r--  1 payam yasaie ${sized(`${home}/contact.txt`, 4)} 2026  contact.txt`,
    ])
  })

  it('keeps only the permissions, size and name on a narrow screen', () => {
    expect(textOf(ls.run(invocation('ls -l'), volume), 'narrow')).toEqual([
      'total 4',
      `-rw-r--r-- ${sized(`${home}/whoami.txt`, 4)} whoami.txt`,
      'drwxr-xr-x 4096 work/',
      `-rw-r--r-- ${sized(`${home}/stack.txt`, 4)} stack.txt`,
      `-rw-r--r-- ${sized(`${home}/contact.txt`, 4)} contact.txt`,
    ])
  })

  it('reads ll as the long format and la as the long format of everything', () => {
    expect(textOf(execute(invocation('ll'), volume))).toEqual(
      textOf(ls.run(invocation('ls -l'), volume)),
    )
    expect(textOf(execute(invocation('la'), volume))).toEqual(
      textOf(ls.run(invocation('ls -la'), volume)),
    )
    expect(textOf(execute(invocation('dir'), volume))).toEqual(
      textOf(ls.run(invocation('ls'), volume)),
    )
  })

  it('accepts flags spelled separately and after the directory being listed', () => {
    expect(textOf(execute(invocation('ll -a'), volume))).toEqual(
      textOf(ls.run(invocation('ls -la'), volume)),
    )
    expect(textOf(ls.run(invocation('ls -l -a'), volume))).toEqual(
      textOf(ls.run(invocation('ls -la'), volume)),
    )
  })

  it('dates each work chapter by the year written inside it', () => {
    expect(textOf(ls.run(invocation('ls -l', '~/work'), volume))).toEqual([
      'total 6',
      chapterRow('1-goodhabitz.md', '2025'),
      chapterRow('2-owow-agency.md', '2021'),
      chapterRow('3-tas-hil-gostar.md', '2019'),
      chapterRow('4-tahlilgaran.md', '2018'),
      chapterRow('5-tabesh-rayan-energy.md', '2017'),
      chapterRow('6-freelance.md', '2010'),
    ])
  })

  it('lists another directory named as an argument without moving into it', () => {
    const named = textOf(ls.run(invocation('ls work'), volume))
    expect(named).toEqual([
      '1-goodhabitz.md  2-owow-agency.md  3-tas-hil-gostar.md  4-tahlilgaran.md  5-tabesh-rayan-energy.md  6-freelance.md',
    ])
    expect(textOf(ls.run(invocation('ls ~/work'), volume))).toEqual(named)
    expect(textOf(ls.run(invocation('ls work/'), volume))).toEqual(named)
  })

  it('lists a single file when the argument names one', () => {
    expect(textOf(ls.run(invocation('ls whoami.txt'), volume))).toEqual(['whoami.txt'])
    expect(textOf(ls.run(invocation('ls -l whoami.txt'), volume))).toEqual([
      'total 1',
      '-rw-r--r--  1 payam yasaie 399 2010  whoami.txt',
    ])
  })

  it('leaves a chapter undated when no year is written inside it', async () => {
    const root = await mkdtemp(join(tmpdir(), 'disk-'))
    await mkdir(join(root, 'home/payam/eindhoven/work'), { recursive: true })
    await writeFile(join(root, 'home/payam/eindhoven/work/9-undated.md'), '# Undated\n')
    const undated = await mount(nodeSource(root))

    expect(textOf(ls.run(invocation('ls -l', '~/work'), undated))).toEqual([
      'total 1',
      '-rw-r--r--  1 payam yasaie 10   9-undated.md',
    ])
  })

  it('leaves the year column empty for a directory the machine dates nothing in', () => {
    expect(textOf(ls.run(invocation('ls -la /etc'), volume))).toEqual([
      'total 4',
      'drwxr-xr-x  1 payam yasaie 4096   ./',
      `-rw-r--r--  1 payam yasaie  ${bytesOf('/etc/issue')}   issue`,
      `-rw-r--r--  1 payam yasaie   ${bytesOf('/etc/motd')}   motd`,
      `-rw-r--r--  1 payam yasaie  ${bytesOf('/etc/yasaie-release')}   yasaie-release`,
    ])
  })

  it('refuses to open the one directory it is not allowed into', () => {
    const refusal = ls.run(invocation('ls ..'), volume)
    expect(textOf(refusal)).toEqual(["ls: cannot open directory '..': permission denied"])
    expect(coloursOf(refusal)).toEqual([['muted']])
  })

  it('says so, quoting the argument as typed, when nothing is there', () => {
    expect(textOf(ls.run(invocation('ls Nowhere'), volume))).toEqual([
      "ls: cannot access 'Nowhere': no such file or directory",
    ])
  })
})
