import { useState, useCallback, useEffect } from 'react'

interface RsvpCheckResult {
  success: boolean
  hasSubmitted?: boolean
  configured?: boolean
  nameMatch?: boolean
  ipMatch?: boolean
  submittedName?: string | null
  checkedBy?: string
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
  const [isInitialized, setIsInitialized] = useState(false)

  // Check if a name has already submitted (server-side verification only - no localStorage)
  const checkRsvpStatus = useCallback(async (name: string): Promise<boolean> => {
    if (!name.trim()) return false

    setIsChecking(true)
    try {
      const response = await fetch(`/api/rsvp?name=${encodeURIComponent(name.trim())}`)
      const data: RsvpCheckResult = await response.json()

      if (data.success) {
        const submitted = data.hasSubmitted || false
        setHasSubmitted(submitted)
        setCheckedName(name.trim())
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

  // Register a new RSVP submission (server-side only - no localStorage)
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

      if (data.alreadySubmitted) {
        return { success: false, alreadySubmitted: true }
      }

      if (data.success) {
        // Update React state only (no browser storage)
        setHasSubmitted(true)
        setCheckedName(name.trim())
        return { success: true }
      }

      return { success: false }
    } catch (error) {
      console.error('Error registering RSVP:', error)
      return { success: false }
    }
  }, [])

  // On mount, check if user has previously submitted (server-side only - no localStorage)
  useEffect(() => {
    const checkPreviousSubmission = async () => {
      try {
        // Check by IP (server-side)
        const response = await fetch('/api/rsvp')
        const data: RsvpCheckResult = await response.json()
        
        if (data.success && data.hasSubmitted && data.submittedName) {
          // IP was found, user already submitted
          setHasSubmitted(true)
          setCheckedName(data.submittedName)
        }
      } catch (error) {
        // Server check failed, no problem - user can still submit
        console.error('Error checking previous submission:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    checkPreviousSubmission()
  }, [])

  // Reset state (useful for testing) - React state only
  const reset = useCallback(() => {
    setHasSubmitted(false)
    setCheckedName(null)
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
