import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Migrate songs from Notion RSVP database → Spotify playlist.
 *
 * Reads all confirmed guests, extracts their song requests,
 * searches Spotify, and adds found tracks to the playlist.
 *
 * Uses the EXACT same token + search logic as spotify-add-track.ts
 */

const NOTION_API_KEY = process.env.NOTION_API_KEY || ''
const NOTION_DB_ID = process.env.NOTION_GUESTS_DATABASE_ID || ''
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ''
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ''
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN || ''
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID || '3v2Zl4aSJgAPMlkxv9FZzS'

// ── Spotify helpers (same as spotify-add-track.ts) ───────────────────

async function getClientCredentialsToken(): Promise<string> {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!r.ok) {
    const t = await r.text()
    throw new Error(`Client credentials failed ${r.status}: ${t}`)
  }
  return ((await r.json()) as any).access_token
}

async function getUserToken(): Promise<string> {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: REFRESH_TOKEN }).toString(),
  })
  if (!r.ok) {
    const t = await r.text()
    throw new Error(`User token failed ${r.status}: ${t}`)
  }
  return ((await r.json()) as any).access_token
}

function cleanQuery(raw: string): string {
  return raw
    .replace(/\(feat\.?[^)]*\)/gi, '')
    .replace(/\[feat\.?[^\]]*\]/gi, '')
    .replace(/\(ft\.?[^)]*\)/gi, '')
    .replace(/\(with[^)]*\)/gi, '')
    .replace(/\(prod\.?[^)]*\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

interface SearchResult {
  uri: string
  name: string
  artist: string
}

async function searchTrack(token: string, raw: string): Promise<SearchResult | null> {
  const queries: string[] = []

  if (raw.includes(' - ')) {
    const [song, artist] = raw.split(' - ').map(s => s.trim())
    queries.push(`${cleanQuery(song)} ${cleanQuery(artist)}`)
    queries.push(`${song} ${artist}`)
  }
  queries.push(cleanQuery(raw))
  queries.push(raw)

  const seen = new Set<string>()
  const unique = queries.filter(q => {
    const k = q.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

  for (const q of unique) {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=3&market=US`
    console.log(`  Trying query: "${q}"`)
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })

    if (!r.ok) {
      const errorText = await r.text()
      console.error(`  ✗ Search failed "${q}": ${r.status} - ${errorText}`)
      continue
    }

    const data = await r.json()
    console.log(`  Response: total=${data?.tracks?.total || 0}, items=${data?.tracks?.items?.length || 0}`)
    
    const items = data?.tracks?.items
    if (items && items.length > 0) {
      const first = items[0]
      console.log(`  ✓ Found: "${first.name}" by ${first.artists?.[0]?.name || 'Unknown'}`)
      return {
        uri: first.uri,
        name: first.name,
        artist: first.artists?.[0]?.name || '',
      }
    } else {
      console.log(`  ✗ No items in response for "${q}"`)
    }
  }

  return null
}

// ── Notion helpers ───────────────────────────────────────────────────

interface NotionSong {
  guestName: string
  song: string
}

async function getSongsFromNotion(): Promise<NotionSong[]> {
  let allResults: any[] = []
  let startCursor: string | undefined

  // Paginate through all results
  do {
    const body: any = {}
    if (startCursor) body.start_cursor = startCursor

    const r = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!r.ok) {
      const t = await r.text()
      throw new Error(`Notion query failed ${r.status}: ${t}`)
    }

    const data = await r.json()
    allResults = allResults.concat(data.results || [])
    startCursor = data.has_more ? data.next_cursor : undefined
  } while (startCursor)

  const songs: NotionSong[] = []

  for (const page of allResults) {
    const props = page.properties || {}

    // Get guest name
    let guestName = ''
    const nameP = props.Name || props.Nombre || props.Guest
    if (nameP?.title) guestName = nameP.title.map((t: any) => t.plain_text).join('')
    else if (nameP?.rich_text) guestName = nameP.rich_text.map((t: any) => t.plain_text).join('')

    // Get song text - try multiple property names
    let songText = ''
    const songP = props['Song Request'] || props['Song'] || props['Cancion'] || props['Canción'] || props['song'] || props['song_request']
    if (songP?.rich_text) songText = songP.rich_text.map((t: any) => t.plain_text).join('')
    else if (songP?.title) songText = songP.title.map((t: any) => t.plain_text).join('')

    if (songText && songText.trim().length > 1) {
      songs.push({ guestName: guestName.trim(), song: songText.trim() })
    }
  }

  return songs
}

// ── handler ──────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  // Check config
  const missing: string[] = []
  if (!NOTION_API_KEY) missing.push('NOTION_API_KEY')
  if (!NOTION_DB_ID) missing.push('NOTION_GUESTS_DATABASE_ID')
  if (!CLIENT_ID) missing.push('SPOTIFY_CLIENT_ID')
  if (!CLIENT_SECRET) missing.push('SPOTIFY_CLIENT_SECRET')
  if (!REFRESH_TOKEN) missing.push('SPOTIFY_REFRESH_TOKEN')
  if (missing.length) return res.status(500).json({ success: false, error: `Missing: ${missing.join(', ')}`, missing })

  try {
    // 1 – Get songs from Notion
    console.log('Fetching songs from Notion...')
    const notionSongs = await getSongsFromNotion()
    console.log(`Found ${notionSongs.length} song(s) in Notion`)

    if (notionSongs.length === 0) {
      return res.status(200).json({ success: true, message: 'No songs in Notion', total: 0, added: 0, failed: 0 })
    }

    // 2 – Get Spotify tokens
    console.log('Getting Spotify tokens...')
    let searchToken: string
    let userToken: string

    try {
      searchToken = await getClientCredentialsToken()
      console.log('✓ Got search token:', searchToken.substring(0, 20) + '...')
      
      // Test the token with a simple search
      const testUrl = 'https://api.spotify.com/v1/search?q=test&type=track&limit=1'
      const testRes = await fetch(testUrl, { headers: { Authorization: `Bearer ${searchToken}` } })
      if (!testRes.ok) {
        const testErr = await testRes.text()
        throw new Error(`Token test failed: ${testRes.status} - ${testErr}`)
      }
      console.log('✓ Token test passed')
    } catch (e: any) {
      return res.status(500).json({ success: false, error: `Search token failed: ${e.message}` })
    }

    try {
      userToken = await getUserToken()
      console.log('✓ Got user token:', userToken.substring(0, 20) + '...')
    } catch (e: any) {
      return res.status(500).json({ success: false, error: `User token failed: ${e.message}` })
    }

    // 3 – Search and add each song
    const added: { song: string; spotifyName: string; artist: string; uri: string }[] = []
    const failed: { song: string; guest: string; reason: string }[] = []

    for (const { guestName, song } of notionSongs) {
      console.log(`\nProcessing: "${song}" (guest: ${guestName})`)

      const result = await searchTrack(searchToken, song)

      if (!result) {
        console.log(`  ✗ Not found on Spotify`)
        failed.push({ song, guest: guestName, reason: 'Not found on Spotify' })
        continue
      }

      console.log(`  ✓ Found: "${result.name}" by ${result.artist} → ${result.uri}`)

      // Add to playlist
      const addRes = await fetch(
        `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [result.uri] }),
        },
      )

      if (!addRes.ok) {
        const err = await addRes.text()
        console.log(`  ✗ Failed to add: ${err}`)
        failed.push({ song, guest: guestName, reason: `Playlist add error: ${addRes.status}` })
      } else {
        console.log(`  ✓ Added to playlist!`)
        added.push({ song, spotifyName: result.name, artist: result.artist, uri: result.uri })
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Migration complete',
      total: notionSongs.length,
      added: added.length,
      failed: failed.length,
      addedSongs: added,
      failedSongs: failed,
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
