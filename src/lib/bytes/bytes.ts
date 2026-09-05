export type SizeFormat = 'human' | 'exact'

const kibibyte = 1024
const mebibyte = kibibyte * 1024

const scaled = (bytes: number, unit: number, suffix: string): string =>
  `${(bytes / unit).toFixed(1).replace(/\.0$/, '')}${suffix}`

const humanised = (bytes: number): string => {
  if (bytes >= mebibyte) return scaled(bytes, mebibyte, 'M')
  if (bytes >= kibibyte) return scaled(bytes, kibibyte, 'K')
  return String(bytes)
}

export const formatSize = (bytes: number, format: SizeFormat): string => {
  switch (format) {
    case 'human':
      return humanised(bytes)
    case 'exact':
      return String(bytes)
  }
}
