import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Add track to Spotify playlist
 * Uses refresh token to get access token, then adds track
 */

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ''
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ''
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN || ''
const SPOTIFY_PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID || '3v2Zl4aSJgAPMlkxv9FZzS'

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

// Get access token using refresh token
async function getAccessToken(): Promise<string> {
  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get access token: ${response.status} - ${error}`)
  }

  const data: SpotifyTokenResponse = await response.json()
  return data.access_token
}

// Add track to playlist
async function addTrackToPlaylist(accessToken: string, trackUri: string): Promise<void> {
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${SPOTIFY_PLAYLIST_ID}/tracks`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [trackUri],
        position: 0, // Add to top of playlist
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to add track: ${response.status} - ${error}`)
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  // Check if Spotify is configured
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    return res.status(500).json({
      success: false,
      error: 'Spotify not configured. Please set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN',
    })
  }

  const { trackUri, trackId } = req.body

  // Accept either trackUri (spotify:track:xxx) or trackId (xxx)
  const uri = trackUri || (trackId ? `spotify:track:${trackId}` : null)

  if (!uri) {
    return res.status(400).json({
      success: false,
      error: 'trackUri or trackId is required',
    })
  }

  try {
    const accessToken = await getAccessToken()
    await addTrackToPlaylist(accessToken, uri)

    return res.status(200).json({
      success: true,
      message: 'Track added to playlist successfully',
    })
  } catch (error: any) {
    console.error('Error adding track to playlist:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to add track to playlist',
    })
  }
}
