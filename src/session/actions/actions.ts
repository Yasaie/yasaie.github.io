import type { Scheduled } from '@/session/state/state'

export type Action =
  | { readonly kind: 'typed'; readonly value: string; readonly caret: number }
  | { readonly kind: 'caretMoved'; readonly caret: number }
  | { readonly kind: 'submitted' }
  | { readonly kind: 'historyBack' }
  | { readonly kind: 'historyForward' }
  | { readonly kind: 'suggestionAccepted' }
  | { readonly kind: 'lineDrained' }
  | { readonly kind: 'focusChanged'; readonly focused: boolean }
  | { readonly kind: 'cleared' }
  | { readonly kind: 'scheduleConsumed'; readonly scheduled: Scheduled }

export const typed = (value: string, caret: number): Action => ({ kind: 'typed', value, caret })

export const caretMoved = (caret: number): Action => ({ kind: 'caretMoved', caret })

export const submitted = (): Action => ({ kind: 'submitted' })

export const historyBack = (): Action => ({ kind: 'historyBack' })

export const historyForward = (): Action => ({ kind: 'historyForward' })

export const suggestionAccepted = (): Action => ({ kind: 'suggestionAccepted' })

export const lineDrained = (): Action => ({ kind: 'lineDrained' })

export const focusChanged = (focused: boolean): Action => ({ kind: 'focusChanged', focused })

export const cleared = (): Action => ({ kind: 'cleared' })

export const scheduleConsumed = (scheduled: Scheduled): Action => ({
  kind: 'scheduleConsumed',
  scheduled,
})
