import { romanize } from 'romans'

/**
 * Converts a positive integer to its Roman numeral string using the `romans` library.
 * Falls back to the plain number string for values outside the supported range (1–3999).
 */
export function toRomanNumeral(n: number): string {
  try {
    return romanize(n)
  }
  catch {
    return String(n)
  }
}
