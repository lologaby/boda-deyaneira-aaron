import { useState, useEffect, useCallback } from 'react'

export interface GuestData {
  id: string
  name: string
  code: string
  plusOneAllowed: boolean
  plusOneName: string | null
  hasConfirmed: boolean
  attendance: 'pending' | 'yes' | 'no'
  totalGuests: number
  song: string | null
  email: string | null
}

interface GuestAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  guest: GuestData | null
  error: string | null
}

// Cookie/localStorage keys
const GUEST_CODE_KEY = 'boda_guest_code'
const GUEST_DATA_KEY = 'boda_guest_data'

export function useGuestAuth() {
  const [state, setState] = useState<GuestAuthState>({
    isAuthenticated: false,
    isLoading: true,
    guest: null,
    error: null,
  })

  // Validate code with server
  const validateCode = useCallback(async (code: string): Promise<{ success: boolean; guest?: GuestData; error?: string }> => {
    try {
      const response = await fetch(`/api/guest?code=${encodeURIComponent(code.toUpperCase().trim())}`)
      const data = await response.json()

      if (data.success && data.guest) {
        // Save to localStorage
        try {
          localStorage.setItem(GUEST_CODE_KEY, code.toUpperCase().trim())
          localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data.guest))
        } catch {
          // Ignore storage errors
        }

        setState({
          isAuthenticated: true,
          isLoading: false,
          guest: data.guest,
          error: null,
        })

        return { success: true, guest: data.guest }
      }

      return { success: false, error: data.error || 'Invalid code' }
    } catch (error) {
      console.error('Error validating code:', error)
      return { success: false, error: 'Connection error. Please try again.' }
    }
  }, [])

  // Submit RSVP
  const submitRsvp = useCallback(async (
    attendance: 'yes' | 'no',
    totalGuests: number,
    song: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!state.guest) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const response = await fetch('/api/guest', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: state.guest.code,
          attendance,
          totalGuests,
          song,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        const updatedGuest: GuestData = {
          ...state.guest,
          hasConfirmed: true,
          attendance,
          totalGuests,
          song,
        }

        setState(prev => ({
          ...prev,
          guest: updatedGuest,
        }))

        // Update localStorage
        try {
          localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(updatedGuest))
        } catch {
          // Ignore
        }

        return { success: true }
      }

      return { success: false, error: data.error || 'Failed to submit RSVP' }
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      return { success: false, error: 'Connection error. Please try again.' }
    }
  }, [state.guest])

  // Logout / clear auth
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_CODE_KEY)
      localStorage.removeItem(GUEST_DATA_KEY)
    } catch {
      // Ignore
    }

    setState({
      isAuthenticated: false,
      isLoading: false,
      guest: null,
      error: null,
    })
  }, [])

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedCode = localStorage.getItem(GUEST_CODE_KEY)
        const savedGuest = localStorage.getItem(GUEST_DATA_KEY)

        if (savedCode && savedGuest) {
          // Use cached data first for faster load
          const guestData = JSON.parse(savedGuest) as GuestData

          setState({
            isAuthenticated: true,
            isLoading: false,
            guest: guestData,
            error: null,
          })

          // Refresh from server in background
          try {
            const response = await fetch(`/api/guest?code=${encodeURIComponent(savedCode)}`)
            const data = await response.json()

            if (data.success && data.guest) {
              setState(prev => ({
                ...prev,
                guest: data.guest,
              }))
              localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data.guest))
            }
          } catch {
            // Keep using cached data
          }
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
          }))
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setState(prev => ({
          ...prev,
          isLoading: false,
        }))
      }
    }

    checkAuth()
  }, [])

  return {
    ...state,
    validateCode,
    submitRsvp,
    logout,
  }
}
