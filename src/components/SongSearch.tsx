import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface MusicTrack {
  id: string
  name: string
  artist: string
  album: string
  albumArt: string
  previewUrl: string | null
  spotifyUrl: string | null
  deezerUrl?: string
  duration: number
}

interface SongSearchProps {
  value: string
  onChange: (value: string, track?: MusicTrack) => void
  placeholder: string
  disabled?: boolean
  content: {
    searching?: string
    noResults?: string
    preview?: string
  }
}

const playIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)

const pauseIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16"/>
    <rect x="14" y="4" width="4" height="16"/>
  </svg>
)

const spotifySmallIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
)

export const SongSearch = ({ value, onChange, placeholder, disabled, content }: SongSearchProps) => {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<MusicTrack[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search
  const searchSongs = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/spotify?q=${encodeURIComponent(searchQuery)}&limit=5`)
      const data = await response.json()

      if (data.success && data.tracks) {
        setResults(data.tracks)
        setShowResults(true)
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange(newValue)
    setSelectedTrack(null)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchSongs(newValue)
    }, 400)
  }

  // Handle track selection
  const handleSelectTrack = (track: MusicTrack) => {
    const displayValue = `${track.name} - ${track.artist}`
    setQuery(displayValue)
    setSelectedTrack(track)
    onChange(displayValue, track)
    setShowResults(false)
    stopPreview()
  }

  // Preview controls
  const playPreview = (track: MusicTrack) => {
    if (!track.previewUrl) return

    if (audioRef.current) {
      audioRef.current.pause()
    }

    audioRef.current = new Audio(track.previewUrl)
    audioRef.current.volume = 0.5
    audioRef.current.play()
    audioRef.current.onended = () => setIsPlaying(false)
    setIsPlaying(true)
  }

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
  }

  const togglePreview = (track: MusicTrack) => {
    if (isPlaying && audioRef.current) {
      stopPreview()
    } else {
      playPreview(track)
    }
  }

  // Detect if mobile
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Prevent body scroll when modal is open on mobile
  useEffect(() => {
    if (isMobile && showResults) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobile, showResults])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  return (
    <div className="song-search" ref={containerRef}>
      <div className="song-search-input-wrap">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={placeholder}
          className="input-field song-search-input"
          disabled={disabled}
          autoComplete="off"
        />
        {isSearching && (
          <div className="song-search-loading">
            <div className="loading-spinner-small" />
          </div>
        )}
      </div>

      {/* Selected track preview */}
      <AnimatePresence>
        {selectedTrack && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="song-selected"
          >
            <img src={selectedTrack.albumArt} alt={selectedTrack.album} className="song-selected-art" />
            <div className="song-selected-info">
              <p className="song-selected-name">{selectedTrack.name}</p>
              <p className="song-selected-artist">{selectedTrack.artist}</p>
            </div>
            {selectedTrack.previewUrl && (
              <button
                type="button"
                className="song-preview-btn"
                onClick={() => togglePreview(selectedTrack)}
                aria-label={isPlaying ? 'Pause' : 'Play preview'}
              >
                {isPlaying ? pauseIcon : playIcon}
              </button>
            )}
            <a
              href={selectedTrack.spotifyUrl || selectedTrack.deezerUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="song-spotify-link"
              aria-label="Open in Spotify"
            >
              {spotifySmallIcon}
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search results - Modal on mobile (via Portal), dropdown on desktop */}
      <AnimatePresence>
        {showResults && results.length > 0 && (
          <>
            {/* Mobile: Full-screen modal with overlay - rendered via Portal to document.body */}
            {isMobile && typeof document !== 'undefined' && createPortal(
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="song-results-overlay"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowResults(false)
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="song-results-modal"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <div className="song-results-modal-header">
                    <h3 className="song-results-modal-title">
                      Selecciona una canción
                    </h3>
                    <button
                      type="button"
                      className="song-results-modal-close"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowResults(false)
                      }}
                      aria-label="Cerrar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="song-results-modal-content">
                    {results.map((track) => (
                      <button
                        key={track.id}
                        type="button"
                        className="song-result"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleSelectTrack(track)
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                      >
                        <img src={track.albumArt} alt={track.album} className="song-result-art" />
                        <div className="song-result-info">
                          <p className="song-result-name">{track.name}</p>
                          <p className="song-result-artist">{track.artist}</p>
                        </div>
                        {track.previewUrl && (
                          <span className="song-result-preview">▶</span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>,
              document.body
            )}
            
            {/* Desktop: Dropup (opens ABOVE input to avoid buttons) */}
            {!isMobile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="song-results"
                onClick={(e) => e.stopPropagation()}
              >
                {results.map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    className="song-result"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSelectTrack(track)
                    }}
                  >
                    <img src={track.albumArt} alt={track.album} className="song-result-art" />
                    <div className="song-result-info">
                      <p className="song-result-name">{track.name}</p>
                      <p className="song-result-artist">{track.artist}</p>
                    </div>
                    {track.previewUrl && (
                      <span className="song-result-preview">▶</span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
