import { useState, useCallback, useEffect } from 'react'

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

// localStorage key for storing the submitted name (only as identifier for server check)
const RSVP_NAME_KEY = 'boda_rsvp_name'

export function useRsvpStatus() {
  const [isChecking, setIsChecking] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [checkedName, setCheckedName] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Check if a name has already submitted (server-side verification)
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

        const submitted = data.hasSubmitted || false
        setHasSubmitted(submitted)
        setCheckedName(name.trim())
        
        // If submitted, save name to localStorage for future visits
        if (submitted) {
          try {
            localStorage.setItem(RSVP_NAME_KEY, name.trim())
          } catch {
            // Ignore localStorage errors
          }
        }
        
        return submitted
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
        
        // Save name to localStorage for future visits
        try {
          localStorage.setItem(RSVP_NAME_KEY, name.trim())
        } catch {
          // Ignore localStorage errors
        }
        
        return { success: true }
      }

      if (data.alreadySubmitted) {
        setHasSubmitted(true)
        setCheckedName(name.trim())
        
        // Save name to localStorage
        try {
          localStorage.setItem(RSVP_NAME_KEY, name.trim())
        } catch {
          // Ignore localStorage errors
        }
        
        return { success: false, alreadySubmitted: true }
      }

      return { success: false }
    } catch (error) {
      console.error('Error registering RSVP:', error)
      // If registration fails, still allow the Google Form submission
      return { success: true }
    }
  }, [])

  // On mount, check if user has previously submitted by checking localStorage + server
  useEffect(() => {
    const checkPreviousSubmission = async () => {
      try {
        const savedName = localStorage.getItem(RSVP_NAME_KEY)
        if (savedName) {
          // Verify with server that they actually submitted
          const response = await fetch(`/api/rsvp?name=${encodeURIComponent(savedName)}`)
          const data: RsvpCheckResult = await response.json()
          
          if (data.success && data.hasSubmitted) {
            setHasSubmitted(true)
            setCheckedName(savedName)
          } else if (data.success && !data.hasSubmitted) {
            // Server says they haven't submitted, clear localStorage
            localStorage.removeItem(RSVP_NAME_KEY)
          }
          // If Redis is not configured (data.configured === false), ignore
        }
      } catch (error) {
        console.error('Error checking previous submission:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    checkPreviousSubmission()
  }, [])

  // Reset state (useful for testing)
  const reset = useCallback(() => {
    setHasSubmitted(false)
    setCheckedName(null)
    try {
      localStorage.removeItem(RSVP_NAME_KEY)
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  return {
    isChecking,
    hasSubmitted,
    checkedName,
    isInitialized,
    checkRsvpStatus,
    registerRsvp,
    reset,
  }
}
