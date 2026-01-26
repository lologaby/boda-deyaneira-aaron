import { useState } from 'react'
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
  onSubmit: (attendance: 'yes' | 'no', totalGuests: number, song: string) => Promise<void>
  isSubmitting: boolean
}

export const GuestRsvpForm = ({
  guest,
  content,
  onSubmit,
  isSubmitting,
}: GuestRsvpFormProps) => {
  const [bringingPlusOne, setBringingPlusOne] = useState(false)
  const [song, setSong] = useState('')
  const [selectedTrack, setSelectedTrack] = useState<any>(null)

  const handleConfirm = async () => {
    const totalGuests = guest.plusOneAllowed && bringingPlusOne ? 2 : 1
    await onSubmit('yes', totalGuests, song)
  }

  const handleDecline = async () => {
    await onSubmit('no', 0, '')
  }

  return (
    <div className="rsvp-guest-form">
      {/* Guest name display */}
      <div className="rsvp-guest-name-card">
        <p className="rsvp-guest-label">{content.nameLabel}</p>
        <p className="rsvp-guest-name">{guest.name}</p>
        {guest.plusOneName && (
          <p className="rsvp-guest-plusone">& {guest.plusOneName}</p>
        )}
      </div>

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
              onClick={() => setBringingPlusOne(false)}
              disabled={isSubmitting}
            >
              {content.plusOneNo || 'No'}
            </button>
          </div>
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
          disabled={isSubmitting || !song.trim()}
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
  )
}
