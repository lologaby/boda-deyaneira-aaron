import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Music Search API - Uses Spotify API (with client credentials)
 * Falls back to Deezer if Spotify is not configured
 */

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ''
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ''

interface MusicTrack {
  id: string
  spotifyId?: string
  name: string
  artist: string
  album: string
  albumArt: string
  previewUrl: string | null
  spotifyUrl: string | null
  deezerUrl?: string
  duration: number
}

// Get Spotify access token using Client Credentials
async function getSpotifyAccessToken(): Promise<string> {
  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token')
  }

  const data = await response.json()
  return data.access_token
}

// Search using Spotify API
async function searchSpotify(query: string, limit: number = 5): Promise<MusicTrack[]> {
  const accessToken = await getSpotifyAccessToken()
  
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to search Spotify')
  }

  const data = await response.json()

  if (!data.tracks || !data.tracks.items || data.tracks.items.length === 0) {
    return []
  }

  return data.tracks.items.map((track: any) => ({
    id: track.id,
    spotifyId: track.id, // Explicitly include Spotify ID for adding to playlist
    name: track.name,
    artist: track.artists[0]?.name || 'Unknown Artist',
    album: track.album.name,
    albumArt: track.album.images[1]?.url || track.album.images[0]?.url || '',
    previewUrl: track.preview_url, // 30-second preview
    spotifyUrl: track.external_urls.spotify,
    duration: track.duration_ms,
  }))
}

// Search using Deezer API (fallback, no authentication required)
async function searchDeezer(query: string, limit: number = 5): Promise<MusicTrack[]> {
  const response = await fetch(
    `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`
  )

  if (!response.ok) {
    throw new Error('Failed to search Deezer')
  }

  const data = await response.json()

  if (!data.data || data.data.length === 0) {
    return []
  }

  return data.data.map((track: any) => ({
    id: track.id.toString(),
    name: track.title,
    artist: track.artist.name,
    album: track.album.title,
    albumArt: track.album.cover_medium || track.album.cover,
    previewUrl: track.preview,
    spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(`${track.title} ${track.artist.name}`)}`,
    deezerUrl: track.link,
    duration: track.duration * 1000,
  }))
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { q, limit } = req.query

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ success: false, error: 'Query is required' })
  }

  try {
    let tracks: MusicTrack[] = []
    let source = 'deezer'

    // Try Spotify first if configured
    if (SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET) {
      try {
        tracks = await searchSpotify(q, Number(limit) || 5)
        source = 'spotify'
      } catch (spotifyError) {
        console.warn('Spotify search failed, falling back to Deezer:', spotifyError)
        // Fall back to Deezer
        tracks = await searchDeezer(q, Number(limit) || 5)
      }
    } else {
      // No Spotify credentials, use Deezer
      tracks = await searchDeezer(q, Number(limit) || 5)
    }

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')

    return res.status(200).json({
      success: true,
      tracks,
      source,
    })
  } catch (error: any) {
    console.error('Music search error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to search music',
    })
  }
}
