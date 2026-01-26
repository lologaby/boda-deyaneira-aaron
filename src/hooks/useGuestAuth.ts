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

  // Validate code with server (no localStorage - using React state only)
  const validateCode = useCallback(async (code: string): Promise<{ success: boolean; guest?: GuestData; error?: string }> => {
    try {
      const response = await fetch(`/api/guest?code=${encodeURIComponent(code.toUpperCase().trim())}`)
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
        // Update React state only (no browser storage)
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

        return { success: true }
      }

      return { success: false, error: data.error || 'Failed to submit RSVP' }
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      return { success: false, error: 'Connection error. Please try again.' }
    }
  }, [state.guest])

  // Logout / clear auth (React state only - no browser storage)
  const logout = useCallback(() => {
    setState({
      isAuthenticated: false,
      isLoading: false,
      guest: null,
      error: null,
    })
  }, [])

  // No persistent auth check on mount - users must re-enter code each session
  // This follows the .cursorrules: "NEVER Use Browser Storage"

  return {
    ...state,
    validateCode,
    submitRsvp,
    logout,
  }
}
