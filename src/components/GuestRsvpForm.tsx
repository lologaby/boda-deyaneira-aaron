import { useState, useEffect, useRef } from 'react'
import type { GuestData } from '../hooks/useGuestAuth'
import { SongSearch } from './SongSearch'

interface GuestRsvpFormProps {
  guest: GuestData
  content: {
    nameLabel: string
    attendanceLabel: string
    attendanceYes: string
    attendanceNo: string
    guestsLabel: string
    songLabel: string
    songPlaceholder: string
    submit: string
    submitting: string
    plusOneQuestion?: string
    plusOneYes?: string
    plusOneNo?: string
    confirmButton?: string
    declineButton?: string
    searching?: string
    noResults?: string
  }
  googleFormConfig: any
  onSubmit: (attendance: 'yes' | 'no', totalGuests: number, song: string, plusOneName?: string) => Promise<void>
  isSubmitting: boolean
}

export const GuestRsvpForm = ({
  guest,
  content,
  onSubmit,
  isSubmitting,
}: GuestRsvpFormProps) => {
  const [bringingPlusOne, setBringingPlusOne] = useState(false)
  const [plusOneName, setPlusOneName] = useState('')
  const [song, setSong] = useState('')
  const [selectedTrack, setSelectedTrack] = useState<any>(null)

  const handleConfirm = async () => {
    const totalGuests = guest.plusOneAllowed && bringingPlusOne ? 2 : 1
    const nameToSubmit = guest.plusOneAllowed && bringingPlusOne ? plusOneName.trim() : undefined
    
    // Add track to Spotify playlist
    // Send spotifyUri if available (fast path), otherwise songName for search fallback
    if (song.trim()) {
      try {
        const payload: Record<string, string> = { songName: song.trim() }
        
        // If user selected a track from Spotify results, send the direct URI
        if (selectedTrack?.spotifyId) {
          payload.spotifyUri = `spotify:track:${selectedTrack.spotifyId}`
        } else if (selectedTrack?.id) {
          payload.trackId = selectedTrack.id
        }
        
        await fetch('/api/spotify-add-track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (error) {
        // Don't block RSVP submission if Spotify fails
        console.warn('Failed to add track to Spotify playlist:', error)
      }
    }
    
    await onSubmit('yes', totalGuests, song, nameToSubmit)
  }

  const handleDecline = async () => {
    await onSubmit('no', 0, '')
  }

  // Gyroscope effect for foiled text
  const nameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (!nameRef.current) return
      
      const gamma = e.gamma || 0 // Left/right tilt (-90 to 90)
      const beta = e.beta || 0   // Front/back tilt (-180 to 180)
      
      // Normalize to 0-100% range
      const x = Math.max(0, Math.min(100, ((gamma + 90) / 180) * 100))
      const y = Math.max(0, Math.min(100, ((beta + 90) / 180) * 100))
      
      nameRef.current.style.setProperty('--shine-x', `${x}%`)
      nameRef.current.style.setProperty('--shine-y', `${y}%`)
    }

    // Request permission for iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation)
          }
        })
        .catch(() => {
          // Permission denied or not supported
        })
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation)
    }

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation)
    }
  }, [])

  return (
    <div className="rsvp-guest-form">
      {/* Invitation letter style card */}
      <div className="rsvp-invitation-letter" ref={nameRef}>
        <div className="rsvp-letter-card">
          <div className="rsvp-letter-content">
            {/* Guest name in golden cursive inside the letter */}
            <p className="rsvp-letter-label">{content.nameLabel}</p>
            <h2 
              className="rsvp-letter-name"
              data-text={`${guest.name}${guest.plusOneName ? ` & ${guest.plusOneName}` : ''}`}
            >
              {guest.name}
              {guest.plusOneName && (
                <span className="rsvp-letter-plusone">& {guest.plusOneName}</span>
              )}
            </h2>
          </div>
        </div>
      </div>

      {/* Form fields container - below the letter */}
      <div className="rsvp-form-box">
        {/* Plus one question (if allowed) */}
        {guest.plusOneAllowed && (
          <div className="rsvp-plusone-section">
            <p className="rsvp-plusone-question">
              {content.plusOneQuestion || '¿Traerás a tu acompañante?'}
            </p>
            <div className="rsvp-plusone-options">
              <button
                type="button"
                className={`rsvp-plusone-btn ${bringingPlusOne ? 'active' : ''}`}
                onClick={() => setBringingPlusOne(true)}
                disabled={isSubmitting}
              >
                {content.plusOneYes || 'Sí'}
              </button>
              <button
                type="button"
                className={`rsvp-plusone-btn ${!bringingPlusOne ? 'active' : ''}`}
                onClick={() => {
                  setBringingPlusOne(false)
                  setPlusOneName('')
                }}
                disabled={isSubmitting}
              >
                {content.plusOneNo || 'No'}
              </button>
            </div>
            {/* Plus one name input (shown when bringing +1) */}
            {bringingPlusOne && (
              <div className="input-group mt-4">
                <label className="input-label">
                  {content.plusOneNameLabel || 'Nombre de tu acompañante'}
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={plusOneName}
                  onChange={(e) => setPlusOneName(e.target.value)}
                  placeholder={content.plusOneNamePlaceholder || 'Ingresa el nombre completo'}
                  disabled={isSubmitting}
                  required={bringingPlusOne}
                />
              </div>
            )}
          </div>
        )}

        {/* Song request with Spotify search */}
        <div className="input-group">
          <label className="rsvp-song-label">{content.songLabel}</label>
          <SongSearch
            value={song}
            onChange={(value, track) => {
              setSong(value)
              setSelectedTrack(track || null)
            }}
            placeholder={content.songPlaceholder}
            disabled={isSubmitting}
            content={{
              searching: content.searching || 'Buscando...',
              noResults: content.noResults || 'No se encontraron resultados',
            }}
          />
        </div>

        {/* Action buttons */}
        <div className="rsvp-action-buttons">
          <button
            type="button"
            className="rsvp-confirm-btn"
            onClick={handleConfirm}
            disabled={isSubmitting || !song.trim() || (bringingPlusOne && !plusOneName.trim())}
          >
            {isSubmitting ? content.submitting : (content.confirmButton || '¡Confirmo mi asistencia!')}
          </button>
          <button
            type="button"
            className="rsvp-decline-btn"
            onClick={handleDecline}
            disabled={isSubmitting}
          >
            {content.declineButton || 'No podré asistir'}
          </button>
        </div>
      </div>
    </div>
  )
}
