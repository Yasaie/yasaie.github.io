import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { DiskSource } from '@/fs/disk-source/disk-source'
import { nodeSource } from '@/fs/node-source/node-source'
import { mount, type Volume } from '@/fs/volume/volume'

export const diskRoot = join(process.cwd(), 'disk')

export const diskDirectories: readonly string[] = [
  '/boot',
  '/etc',
  '/home',
  '/home/payam',
  '/home/payam/eindhoven',
  '/home/payam/eindhoven/work',
]

export const diskFiles: readonly string[] = [
  '/.nojekyll',
  '/boot/favicon.svg',
  '/boot/preview.png',
  '/etc/issue',
  '/etc/motd',
  '/etc/yasaie-release',
  '/home/payam/eindhoven/.secrets',
  '/home/payam/eindhoven/contact.txt',
  '/home/payam/eindhoven/stack.txt',
  '/home/payam/eindhoven/whoami.txt',
  '/home/payam/eindhoven/work/1-goodhabitz.md',
  '/home/payam/eindhoven/work/2-owow-agency.md',
  '/home/payam/eindhoven/work/3-tas-hil-gostar.md',
  '/home/payam/eindhoven/work/4-tahlilgaran.md',
  '/home/payam/eindhoven/work/5-tabesh-rayan-energy.md',
  '/home/payam/eindhoven/work/6-freelance.md',
]

export const diskPaths: readonly string[] = [...diskDirectories, ...diskFiles].toSorted()

export const realBytes = (path: string): number => statSync(join(diskRoot, path)).size

export const realText = (path: string): string => readFileSync(join(diskRoot, path), 'utf8')

export const realDiskSource = (): DiskSource => nodeSource(diskRoot)

export const mountRealDisk = (): Promise<Volume> => mount(realDiskSource())
