import { describe, expect, it } from 'vitest'
import { realBytes } from '@/testing/disk/disk'
import { formatSize } from '@/tty/bytes/bytes'

describe('formatSize, human', () => {
  it('prints a small file as a bare count with no unit', () => {
    expect(formatSize(realBytes('/home/payam/eindhoven/whoami.txt'), 'human')).toBe('399')
  })

  it('prints nothing at all as zero', () => {
    expect(formatSize(realBytes('/.nojekyll'), 'human')).toBe('0')
  })

  it('stays in bare bytes right up to the last byte below a kibibyte', () => {
    expect(formatSize(1023, 'human')).toBe('1023')
  })

  it('switches to kibibytes at exactly one kibibyte', () => {
    expect(formatSize(1024, 'human')).toBe('1K')
  })

  it('drops a trailing zero decimal rather than printing 1.0K', () => {
    expect(formatSize(1025, 'human')).toBe('1K')
  })

  it('keeps one decimal when the size is genuinely between whole units', () => {
    expect(formatSize(1536, 'human')).toBe('1.5K')
  })

  it('prints a directory as 4K', () => {
    expect(formatSize(4096, 'human')).toBe('4K')
  })

  it('stays in kibibytes right up to the last byte below a mebibyte', () => {
    expect(formatSize(1048575, 'human')).toBe('1024K')
  })

  it('switches to mebibytes at exactly one mebibyte', () => {
    expect(formatSize(1048576, 'human')).toBe('1M')
  })

  it('prints the sealed file the machine will not open as 1.9M', () => {
    expect(formatSize(realBytes('/home/payam/eindhoven/.secrets'), 'human')).toBe('1.9M')
  })
})

describe('formatSize, exact', () => {
  it('prints the raw byte count with no unit however large it is', () => {
    expect(formatSize(realBytes('/home/payam/eindhoven/.secrets'), 'exact')).toBe('2040832')
  })

  it('leaves a size that would have been scaled unscaled', () => {
    expect(formatSize(4096, 'exact')).toBe('4096')
  })

  it('prints nothing at all as zero', () => {
    expect(formatSize(0, 'exact')).toBe('0')
  })
})
