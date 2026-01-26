import { useState, useCallback } from 'react'

interface RsvpCheckResult {
  success: boolean
  hasSubmitted?: boolean
  configured?: boolean
  error?: string
}

interface RsvpRegisterResult {
  success: boolean
  registered?: boolean
  alreadySubmitted?: boolean
  error?: string
}

export function useRsvpStatus() {
  const [isChecking, setIsChecking] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [checkedName, setCheckedName] = useState<string | null>(null)

  // Check if a name has already submitted
  const checkRsvpStatus = useCallback(async (name: string): Promise<boolean> => {
    if (!name.trim()) return false

    setIsChecking(true)
    try {
      const response = await fetch(`/api/rsvp?name=${encodeURIComponent(name.trim())}`)
      const data: RsvpCheckResult = await response.json()

      if (data.success) {
        // If Redis is not configured, allow submission
        if (data.configured === false) {
          setHasSubmitted(false)
          setCheckedName(name.trim())
          return false
        }

        setHasSubmitted(data.hasSubmitted || false)
        setCheckedName(name.trim())
        return data.hasSubmitted || false
      }
      return false
    } catch (error) {
      console.error('Error checking RSVP status:', error)
      return false
    } finally {
      setIsChecking(false)
    }
  }, [])

  // Register a new RSVP submission
  const registerRsvp = useCallback(async (
    name: string,
    attendance: string,
    guests: number,
    song: string
  ): Promise<{ success: boolean; alreadySubmitted?: boolean }> => {
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          attendance,
          guests,
          song,
        }),
      })

      const data: RsvpRegisterResult = await response.json()

      if (data.success && data.registered) {
        setHasSubmitted(true)
        setCheckedName(name.trim())
        return { success: true }
      }

      if (data.alreadySubmitted) {
        setHasSubmitted(true)
        setCheckedName(name.trim())
        return { success: false, alreadySubmitted: true }
      }

      return { success: false }
    } catch (error) {
      console.error('Error registering RSVP:', error)
      // If registration fails, still allow the Google Form submission
      return { success: true }
    }
  }, [])

  // Reset state (useful for testing or name changes)
  const reset = useCallback(() => {
    setHasSubmitted(false)
    setCheckedName(null)
  }, [])

  return {
    isChecking,
    hasSubmitted,
    checkedName,
    checkRsvpStatus,
    registerRsvp,
    reset,
  }
}
