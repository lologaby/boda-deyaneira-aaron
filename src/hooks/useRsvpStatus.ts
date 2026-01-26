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

// localStorage keys
const RSVP_NAME_KEY = 'boda_rsvp_name'
const RSVP_SUBMITTED_KEY = 'boda_rsvp_submitted'

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
        // If Redis is not configured, check localStorage
        if (data.configured === false) {
          const localSubmitted = localStorage.getItem(RSVP_SUBMITTED_KEY) === 'true'
          const localName = localStorage.getItem(RSVP_NAME_KEY)
          if (localSubmitted && localName?.toLowerCase() === name.trim().toLowerCase()) {
            setHasSubmitted(true)
            setCheckedName(name.trim())
            return true
          }
          return false
        }

        const submitted = data.hasSubmitted || false
        setHasSubmitted(submitted)
        setCheckedName(name.trim())
        
        // If submitted, save to localStorage for future visits
        if (submitted) {
          try {
            localStorage.setItem(RSVP_NAME_KEY, name.trim())
            localStorage.setItem(RSVP_SUBMITTED_KEY, 'true')
          } catch {
            // Ignore localStorage errors
          }
        }
        
        return submitted
      }
      return false
    } catch (error) {
      console.error('Error checking RSVP status:', error)
      // Fallback to localStorage
      const localSubmitted = localStorage.getItem(RSVP_SUBMITTED_KEY) === 'true'
      const localName = localStorage.getItem(RSVP_NAME_KEY)
      if (localSubmitted && localName?.toLowerCase() === name.trim().toLowerCase()) {
        setHasSubmitted(true)
        setCheckedName(name.trim())
        return true
      }
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
    // Always save to localStorage first (as fallback)
    try {
      localStorage.setItem(RSVP_NAME_KEY, name.trim())
      localStorage.setItem(RSVP_SUBMITTED_KEY, 'true')
    } catch {
      // Ignore localStorage errors
    }

    // Update state immediately
    setHasSubmitted(true)
    setCheckedName(name.trim())

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

      if (data.alreadySubmitted) {
        return { success: false, alreadySubmitted: true }
      }

      return { success: true }
    } catch (error) {
      console.error('Error registering RSVP:', error)
      // Registration to server failed, but localStorage is saved
      // Still return success since Google Form submission is separate
      return { success: true }
    }
  }, [])

  // On mount, check if user has previously submitted
  useEffect(() => {
    const checkPreviousSubmission = async () => {
      try {
        // First check localStorage
        const localSubmitted = localStorage.getItem(RSVP_SUBMITTED_KEY) === 'true'
        const savedName = localStorage.getItem(RSVP_NAME_KEY)
        
        if (localSubmitted && savedName) {
          // Set immediately from localStorage
          setHasSubmitted(true)
          setCheckedName(savedName)
          
          // Then verify with server (optional, don't block on it)
          try {
            const response = await fetch(`/api/rsvp?name=${encodeURIComponent(savedName)}`)
            const data: RsvpCheckResult = await response.json()
            
            // If server explicitly says not submitted, clear (but this is rare)
            if (data.success && data.hasSubmitted === false && data.configured !== false) {
              // Server disagrees - but trust localStorage for better UX
              // User already saw the confirmation
            }
          } catch {
            // Server check failed, trust localStorage
          }
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
      localStorage.removeItem(RSVP_SUBMITTED_KEY)
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
