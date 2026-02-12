import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Migrate songs from Notion database to Spotify playlist
 * ONE-TIME MIGRATION: Reads RSVP songs from Notion and adds them to Spotify playlist
 */

const NOTION_API_KEY = process.env.NOTION_API_KEY || ''
const NOTION_DATABASE_ID = process.env.NOTION_GUESTS_DATABASE_ID || ''
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ''
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ''
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN || ''
const SPOTIFY_PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID || '3v2Zl4aSJgAPMlkxv9FZzS'

interface SpotifyTokenResponse {
  access_token: string
}

// Get Spotify access token
async function getSpotifyAccessToken(useRefreshToken: boolean = true): Promise<string> {
  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
  
  const body = useRefreshToken
    ? new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: SPOTIFY_REFRESH_TOKEN,
      })
    : 'grant_type=client_credentials'

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token')
  }

  const data: SpotifyTokenResponse = await response.json()
  return data.access_token
}

// Search Spotify for a track with multiple strategies
async function searchSpotifyTrack(accessToken: string, query: string): Promise<string | null> {
  console.log(`Searching for: "${query}"`)
  
  // Strategy 1: If format is "Song - Artist", search with both together (most common format)
  if (query.includes(' - ')) {
    const parts = query.split(' - ')
    if (parts.length === 2) {
      const [track, artist] = parts
      const searchQuery = `${track.trim()} ${artist.trim()}`
      
      console.log(`  Strategy 1: Simple search "${searchQuery}"`)
      
      // Try simple combined search (usually works best)
      let response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=3`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.tracks?.items?.length > 0) {
          console.log(`  ✓ Found ${data.tracks.items.length} results`)
          console.log(`  First result: "${data.tracks.items[0].name}" by ${data.tracks.items[0].artists[0].name}`)
          return data.tracks.items[0].id
        } else {
          console.log(`  ✗ No results`)
        }
      } else {
        console.log(`  ✗ API error: ${response.status}`)
        const error = await response.text()
        console.log(`  Error details: ${error}`)
      }

      // Strategy 2: Try structured search without quotes
      const structuredQuery = `track:${track.trim()} artist:${artist.trim()}`
      console.log(`  Strategy 2: Structured search "${structuredQuery}"`)
      
      response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(structuredQuery)}&type=track&limit=3`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.tracks?.items?.length > 0) {
          console.log(`  ✓ Found ${data.tracks.items.length} results`)
          return data.tracks.items[0].id
        } else {
          console.log(`  ✗ No results`)
        }
      }
    }
  }
  
  // Strategy 3: Plain search as fallback
  console.log(`  Strategy 3: Plain search "${query}"`)
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=3`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }
  )
  
  if (response.ok) {
    const data = await response.json()
    if (data.tracks?.items?.length > 0) {
      console.log(`  ✓ Found ${data.tracks.items.length} results`)
      return data.tracks.items[0].id
    } else {
      console.log(`  ✗ No results from any strategy`)
    }
  } else {
    console.log(`  ✗ API error: ${response.status}`)
  }
  
  return null
}

// Add tracks to Spotify playlist
async function addTracksToPlaylist(accessToken: string, trackUris: string[]): Promise<void> {
  // Spotify allows max 100 tracks per request
  const chunks = []
  for (let i = 0; i < trackUris.length; i += 100) {
    chunks.push(trackUris.slice(i, i + 100))
  }

  for (const chunk of chunks) {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${SPOTIFY_PLAYLIST_ID}/tracks`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: chunk }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to add chunk:', error)
    }
  }
}

// Get songs from Notion
async function getSongsFromNotion(): Promise<string[]> {
  const response = await fetch(
    `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: 'Attendance',
          select: { equals: 'Yes' },
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch from Notion')
  }

  const data = await response.json()
  const songs: string[] = []

  for (const page of data.results || []) {
    const properties = page.properties || {}
    
    // Get song from "Song Request" property (rich_text or title)
    const songProperty = properties['Song Request'] || properties['Song'] || properties['Cancion']
    let songText = ''
    
    if (songProperty?.rich_text) {
      songText = songProperty.rich_text.map((t: any) => t.plain_text).join('')
    } else if (songProperty?.title) {
      songText = songProperty.title.map((t: any) => t.plain_text).join('')
    }

    if (songText && songText.trim().length > 0) {
      songs.push(songText.trim())
    }
  }

  return songs
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  // Check configuration
  const missingConfig: string[] = []
  if (!NOTION_API_KEY) missingConfig.push('NOTION_API_KEY')
  if (!NOTION_DATABASE_ID) missingConfig.push('NOTION_GUESTS_DATABASE_ID')
  if (!SPOTIFY_CLIENT_ID) missingConfig.push('SPOTIFY_CLIENT_ID')
  if (!SPOTIFY_CLIENT_SECRET) missingConfig.push('SPOTIFY_CLIENT_SECRET')
  if (!SPOTIFY_REFRESH_TOKEN) missingConfig.push('SPOTIFY_REFRESH_TOKEN')

  if (missingConfig.length > 0) {
    return res.status(500).json({
      success: false,
      error: `Missing configuration: ${missingConfig.join(', ')}`,
      missing: missingConfig,
    })
  }

  try {
    // Get songs from Notion
    console.log('Fetching songs from Notion...')
    const songs = await getSongsFromNotion()
    console.log(`Found ${songs.length} songs in Notion`)

    if (songs.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No songs found in Notion database',
        added: 0,
        failed: 0,
      })
    }

    // Get Spotify access tokens
    console.log('Getting Spotify access tokens...')
    const searchAccessToken = await getSpotifyAccessToken(false) // Client credentials for search
    console.log('Got search token:', searchAccessToken.substring(0, 20) + '...')
    const playlistAccessToken = await getSpotifyAccessToken(true) // Refresh token for playlist modification
    console.log('Got playlist token')

    // Search for each song and collect track IDs
    const trackUris: string[] = []
    const failed: string[] = []

    console.log('\nStarting song search...')
    for (const song of songs) {
      try {
        const trackId = await searchSpotifyTrack(searchAccessToken, song)
        if (trackId) {
          console.log(`✓ Found: ${song} (ID: ${trackId})`)
          trackUris.push(`spotify:track:${trackId}`)
        } else {
          console.log(`✗ Not found: ${song}`)
          failed.push(song)
        }
      } catch (error) {
        console.error(`Failed to search for "${song}":`, error)
        failed.push(song)
      }
    }

    // Add all tracks to playlist
    if (trackUris.length > 0) {
      await addTracksToPlaylist(playlistAccessToken, trackUris)
    }

    return res.status(200).json({
      success: true,
      message: 'Migration complete',
      total: songs.length,
      added: trackUris.length,
      failed: failed.length,
      failedSongs: failed,
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Migration failed',
    })
  }
}
