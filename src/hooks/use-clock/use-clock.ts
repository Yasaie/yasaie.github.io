import { useState } from 'react'
import { useInterval } from 'usehooks-ts'

const refreshMs = 10_000

const amsterdam = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Amsterdam',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const readClock = (): string => amsterdam.format(new Date())

export const useClock = (): string => {
  const [time, setTime] = useState(readClock)

  useInterval(() => setTime(readClock()), refreshMs)

  return time
}
