import { type SwipeableHandlers, useSwipeable } from 'react-swipeable'

const thumbTravelPx = 48

export const useSwipeToAccept = (accept: () => void): SwipeableHandlers =>
  useSwipeable({
    onSwipedRight: accept,
    delta: thumbTravelPx,
    preventScrollOnSwipe: false,
    trackMouse: false,
  })
