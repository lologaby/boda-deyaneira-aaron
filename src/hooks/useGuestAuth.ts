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

export function useGuestAuth() {
  const [state, setState] = useState<GuestAuthState>({
    isAuthenticated: false,
    isLoading: false,
    guest: null,
    error: null,
  })

  // Validate code with server (sets HTTP-only cookie for one-time magic)
  const validateCode = useCallback(async (code: string): Promise<{ success: boolean; guest?: GuestData; error?: string }> => {
    try {
      const response = await fetch(`/api/guest?code=${encodeURIComponent(code.toUpperCase().trim())}`, {
        credentials: 'include', // Include cookies
      })
      const data = await response.json()

      if (data.success && data.guest) {
        // Store in React state only (no browser storage)
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
    song: string,
    plusOneName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!state.guest) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const response = await fetch('/api/guest', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          code: state.guest.code,
          attendance,
          totalGuests,
          song,
          plusOneName: plusOneName || null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update React state only (no browser storage)
        const updatedGuest: GuestData = {
          ...state.guest,
          hasConfirmed: true,
          attendance,
          totalGuests,
          song,
          plusOneName: plusOneName || state.guest.plusOneName,
        }

        setState(prev => ({
          ...prev,
          guest: updatedGuest,
        }))

        return { success: true }
      }

      return { success: false, error: data.error || 'Failed to submit RSVP' }
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      return { success: false, error: 'Connection error. Please try again.' }
    }
  }, [state.guest])

  // Logout / clear auth (clears server cookie)
  const logout = useCallback(async () => {
    try {
      // Clear cookie on server
      await fetch('/api/guest?logout=true', {
        method: 'GET',
        credentials: 'include', // Include cookies
      })
    } catch {
      // Ignore errors
    }
    
    setState({
      isAuthenticated: false,
      isLoading: false,
      guest: null,
      error: null,
    })
  }, [])

  // Check for existing auth cookie on mount (one-time magic code)
  useEffect(() => {
    const checkAuthCookie = async () => {
      setState(prev => ({ ...prev, isLoading: true }))
      
      try {
        // Request without code - server will check cookie
        const response = await fetch('/api/guest', {
          credentials: 'include', // Include cookies
        })
        const data = await response.json()

        if (data.success && data.guest) {
          setState({
            isAuthenticated: true,
            isLoading: false,
            guest: data.guest,
            error: null,
          })
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
          }))
        }
      } catch (error) {
        console.error('Error checking auth cookie:', error)
        setState(prev => ({
          ...prev,
          isLoading: false,
        }))
      }
    }

    checkAuthCookie()
  }, [])

  return {
    ...state,
    validateCode,
    submitRsvp,
    logout,
  }
}
