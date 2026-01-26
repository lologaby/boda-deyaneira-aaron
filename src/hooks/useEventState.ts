import { useState, useEffect } from 'react'

export type EventState = 'before' | 'during' | 'after'

// Wedding dates in Puerto Rico time (AST, UTC-4)
const WEDDING_START = new Date('2026-07-18T17:00:00-04:00') // 5:00 PM AST
const WEDDING_END = new Date('2026-07-18T23:00:00-04:00')   // 11:00 PM AST

/**
 * Hook to determine the current state of the wedding event.
 * 
 * States:
 * - 'before': Before July 18, 2026 at 5:00 PM AST
 * - 'during': July 18, 2026 from 5:00 PM to 11:00 PM AST
 * - 'after': After July 18, 2026 at 11:00 PM AST
 * 
 * For development/testing, set VITE_OVERRIDE_EVENT_STATE in .env.local
 */
export const useEventState = (): EventState => {
  const [eventState, setEventState] = useState<EventState>(() => {
    // Check for development override
    const override = import.meta.env.VITE_OVERRIDE_EVENT_STATE as string | undefined
    if (override && ['before', 'during', 'after'].includes(override)) {
      return override as EventState
    }
    return calculateEventState()
  })

  useEffect(() => {
    // If there's an override, don't run the interval
    const override = import.meta.env.VITE_OVERRIDE_EVENT_STATE as string | undefined
    if (override && ['before', 'during', 'after'].includes(override)) {
      return
    }

    const checkEventState = () => {
      const newState = calculateEventState()
      setEventState(prevState => {
        if (prevState !== newState) {
          return newState
        }
        return prevState
      })
    }

    // Check immediately
    checkEventState()

    // Check every minute
    const interval = setInterval(checkEventState, 60000)

    return () => clearInterval(interval)
  }, [])

  return eventState
}

function calculateEventState(): EventState {
  const now = new Date()

  if (now < WEDDING_START) {
    return 'before'
  } else if (now >= WEDDING_START && now < WEDDING_END) {
    return 'during'
  } else {
    return 'after'
  }
}

// Export constants for use in other components if needed
export const WEDDING_DATE = WEDDING_START
export const WEDDING_END_DATE = WEDDING_END
