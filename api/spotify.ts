import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Music Search API - Uses Deezer (no auth required)
 * Falls back gracefully if Deezer is unavailable
 */

interface MusicTrack {
  id: string
  name: string
  artist: string
  album: string
  albumArt: string
  previewUrl: string | null
  spotifyUrl: string | null
  deezerUrl: string
  duration: number
}

// Search using Deezer API (no authentication required!)
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
    previewUrl: track.preview, // Deezer provides 30-second previews
    spotifyUrl: null, // Could add Spotify search link
    deezerUrl: track.link,
    duration: track.duration * 1000, // Convert to ms
  }))
}

// Generate Spotify search link (for opening in Spotify app)
function generateSpotifySearchUrl(trackName: string, artistName: string): string {
  const query = encodeURIComponent(`${trackName} ${artistName}`)
  return `https://open.spotify.com/search/${query}`
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
    const tracks = await searchDeezer(q, Number(limit) || 5)

    // Add Spotify search links
    const tracksWithSpotify = tracks.map(track => ({
      ...track,
      spotifyUrl: generateSpotifySearchUrl(track.name, track.artist),
    }))

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')

    return res.status(200).json({
      success: true,
      tracks: tracksWithSpotify,
      source: 'deezer',
    })
  } catch (error: any) {
    console.error('Music search error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to search music',
    })
  }
}
