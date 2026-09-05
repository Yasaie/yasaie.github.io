import { useState } from 'react'
import { useEventListener } from 'usehooks-ts'

const held = (event: KeyboardEvent): boolean => event.metaKey || event.ctrlKey

export const useFollowKey = (): boolean => {
  const [following, setFollowing] = useState(false)

  useEventListener('keydown', (event) => setFollowing(held(event)))
  useEventListener('keyup', (event) => setFollowing(held(event)))
  useEventListener('blur', () => setFollowing(false))

  return following
}
