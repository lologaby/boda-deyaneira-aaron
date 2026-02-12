import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Add a track to the Spotify playlist.
 *
 * Accepts three ways to identify the track (tried in order):
 *   1. spotifyUri  – "spotify:track:XXXXX" (instant, no search needed)
 *   2. trackId     – Spotify track ID (converted to URI)
 *   3. songName    – Free-text search (e.g. "Mil Mujeres - Rauw Alejandro")
 *
 * Uses the SAME client-credentials flow that the working /api/spotify search uses.
 */

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ''
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ''
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN || ''
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID || '3v2Zl4aSJgAPMlkxv9FZzS'

// ── helpers ──────────────────────────────────────────────────────────

async function getClientCredentialsToken(): Promise<string> {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) throw new Error(`Client-credentials token failed: ${res.status}`)
  const json = await res.json()
  return json.access_token as string
}

async function getUserToken(): Promise<string> {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: REFRESH_TOKEN,
  })
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  if (!res.ok) throw new Error(`User token failed: ${res.status}`)
  const json = await res.json()
  return json.access_token as string
}

/** Clean a song string for better search results */
function cleanQuery(raw: string): string {
  return raw
    .replace(/\(feat\.?[^)]*\)/gi, '')   // remove (feat. ...)
    .replace(/\[feat\.?[^\]]*\]/gi, '')   // remove [feat. ...]
    .replace(/\(ft\.?[^)]*\)/gi, '')      // remove (ft. ...)
    .replace(/\(with[^)]*\)/gi, '')       // remove (with ...)
    .replace(/\(prod\.?[^)]*\)/gi, '')    // remove (prod. ...)
    .replace(/\s{2,}/g, ' ')             // collapse spaces
    .trim()
}

/**
 * Search Spotify and return the first track URI.
 * Tries multiple query variations to maximise hit rate.
 */
async function searchTrack(
  token: string,
  raw: string,
): Promise<{ uri: string; name: string; artist: string } | null> {

  const queries: string[] = []

  // If format is "Song - Artist" split and build queries
  if (raw.includes(' - ')) {
    const [song, artist] = raw.split(' - ').map(s => s.trim())
    const cleanSong = cleanQuery(song)
    const cleanArtist = cleanQuery(artist)

    queries.push(`${cleanSong} ${cleanArtist}`)          // "Mil Mujeres Rauw Alejandro"
    queries.push(`${song} ${artist}`)                     // with feat info intact
  }

  queries.push(cleanQuery(raw))                           // whole string cleaned
  queries.push(raw)                                       // raw as-is

  // De-duplicate while preserving order
  const seen = new Set<string>()
  const unique = queries.filter(q => {
    const key = q.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  for (const q of unique) {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=3&market=US`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      console.error(`Search failed for "${q}": ${res.status}`)
      continue
    }

    const data = await res.json()
    const items = data?.tracks?.items
    if (items && items.length > 0) {
      const track = items[0]
      return {
        uri: track.uri,                           // "spotify:track:XXXXX"
        name: track.name,
        artist: track.artists?.[0]?.name || '',
      }
    }
  }

  return null
}

// ── handler ──────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return res.status(500).json({ success: false, error: 'Spotify not configured (missing env vars)' })
  }

  const { spotifyUri, trackId, songName } = req.body || {}

  try {
    // 1. Resolve the spotify URI
    let uri = ''

    if (spotifyUri && typeof spotifyUri === 'string' && spotifyUri.startsWith('spotify:track:')) {
      uri = spotifyUri
    } else if (trackId && typeof trackId === 'string') {
      uri = `spotify:track:${trackId}`
    }

    // 2. If we still have no URI, search by name
    if (!uri && songName && typeof songName === 'string') {
      const searchToken = await getClientCredentialsToken()
      const result = await searchTrack(searchToken, songName)
      if (result) {
        uri = result.uri
        console.log(`Searched "${songName}" → found "${result.name}" by ${result.artist}`)
      } else {
        console.warn(`Searched "${songName}" → nothing found`)
        return res.status(404).json({
          success: false,
          error: `Track not found on Spotify: "${songName}"`,
        })
      }
    }

    if (!uri) {
      return res.status(400).json({ success: false, error: 'Provide spotifyUri, trackId, or songName' })
    }

    // 3. Add to playlist using user token (requires playlist-modify scope)
    const userToken = await getUserToken()
    const addRes = await fetch(
      `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [uri], position: 0 }),
      },
    )

    if (!addRes.ok) {
      const err = await addRes.text()
      throw new Error(`Spotify API ${addRes.status}: ${err}`)
    }

    return res.status(200).json({ success: true, uri })
  } catch (error: any) {
    console.error('spotify-add-track error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
