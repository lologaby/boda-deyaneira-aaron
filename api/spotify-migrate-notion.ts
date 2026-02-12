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
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID || '3Nvj5752VBO0BXTpSm5hkH'

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

interface SearchDebug {
  queries: string[]
  attempts: Array<{ 
    query: string
    status: number
    total?: number
    items?: number
    error?: string
    is403?: boolean
    solution?: string
    hasTracks?: boolean
    tracksKeys?: string[]
    firstResult?: { name: string; artist: string; uri: string; id: string } | null
  }>
  addError?: string
  playlistId?: string
  trackUri?: string
  httpStatus?: number
  errorJson?: any
}

async function searchTrack(
  token: string,
  raw: string,
  debug?: SearchDebug
): Promise<SearchResult | null> {
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

  if (debug) {
    debug.queries = unique
    debug.attempts = []
  }

  for (const q of unique) {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=3&market=US`
    console.log(`  Trying query: "${q}"`)
    
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })

    if (!r.ok) {
      const errorText = await r.text()
      console.error(`  ✗ Search failed "${q}": ${r.status} - ${errorText}`)
      
      // If 403, this means app needs users added or Extended Quota Mode
      if (r.status === 403) {
        console.error(`  ⚠ 403 Error: Spotify app needs configuration`)
        console.error(`  Solution: Add users at https://developer.spotify.com/dashboard`)
        console.error(`  Or request Extended Quota Mode`)
      }
      
      if (debug) {
        debug.attempts.push({ 
          query: q, 
          status: r.status, 
          error: errorText.substring(0, 200),
          is403: r.status === 403,
          solution: r.status === 403 ? 'Add users to Spotify app or request Extended Quota Mode' : undefined,
        })
      }
      continue
    }

    const data = await r.json()
    
    // Debug: log the full response structure
    console.log(`  Full response keys:`, Object.keys(data))
    console.log(`  Tracks structure:`, data?.tracks ? Object.keys(data.tracks) : 'no tracks')
    
    const total = data?.tracks?.total || 0
    const items = data?.tracks?.items || []
    
    console.log(`  Response: total=${total}, items=${items.length}`)
    if (items.length > 0) {
      const first = items[0]
      console.log(`  First result: "${first.name}" by ${first.artists?.[0]?.name || 'Unknown'}`)
      console.log(`  First URI: ${first.uri}`)
    } else if (total > 0) {
      console.log(`  ⚠ WARNING: total=${total} but items.length=0 - this is unusual!`)
    }
    
    if (debug) {
      debug.attempts.push({ 
        query: q, 
        status: r.status, 
        total, 
        items: items.length,
        hasTracks: !!data?.tracks,
        tracksKeys: data?.tracks ? Object.keys(data.tracks) : [],
        firstResult: items.length > 0 ? {
          name: items[0].name,
          artist: items[0].artists?.[0]?.name,
          uri: items[0].uri,
          id: items[0].id,
        } : null,
      })
    }
    
    if (items && items.length > 0) {
      const first = items[0]
      if (!first.uri) {
        console.error(`  ⚠ First item has no URI!`, first)
        continue
      }
      console.log(`  ✓ Found: "${first.name}" by ${first.artists?.[0]?.name || 'Unknown'}`)
      return {
        uri: first.uri,
        name: first.name,
        artist: first.artists?.[0]?.name || '',
      }
    } else {
      console.log(`  ✗ No items in response for "${q}" (total=${total})`)
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
  // Log immediately to confirm function is being called
  console.log('=== SPOTIFY MIGRATE NOTION CALLED ===')
  console.log('Method:', req.method)
  console.log('Timestamp:', new Date().toISOString())
  
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request - returning 200')
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    console.log(`Wrong method: ${req.method} - returning 405`)
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
  
  console.log('POST request received - starting migration')

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
    // Strategy: Use Client Credentials for searches (works with users added)
    // Use Refresh Token for playlist operations (needs user permissions)
    console.log('Getting Spotify tokens...')
    let searchToken: string
    let userToken: string

    // Try Client Credentials first for searches (works when users are added to app)
    try {
      searchToken = await getClientCredentialsToken()
      console.log('✓ Got client credentials token for searches')
    } catch (e: any) {
      console.log('⚠ Client credentials failed, trying refresh token for searches')
      // Fallback to refresh token if client credentials fails
      try {
        searchToken = await getUserToken()
        console.log('✓ Using refresh token for searches (fallback)')
      } catch (e2: any) {
        return res.status(500).json({ success: false, error: `Both tokens failed for search: ${e.message}, ${e2.message}` })
      }
    }

    // Get user token (refresh token) for playlist operations
    try {
      userToken = await getUserToken()
      console.log('✓ Got user token (refresh token) for playlist operations')
    } catch (e: any) {
      return res.status(500).json({ success: false, error: `User token failed: ${e.message}` })
    }

    console.log(`Search token: ${searchToken.substring(0, 20)}...`)
    console.log(`User token: ${userToken.substring(0, 20)}...`)

    // 2.5 – Verify token user and playlist owner (once, before loop)
    let tokenUserId: string | null = null
    let playlistOwnerId: string | null = null
    
    try {
      const profileRes = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${userToken}` }
      })
      if (profileRes.ok) {
        const profile = await profileRes.json()
        tokenUserId = profile.id
        console.log(`Token user: ${profile.display_name || profile.id} (${profile.id})`)
      }
    } catch (e) {
      console.log(`⚠ Could not verify token user: ${e}`)
    }
    
    try {
      const playlistRes = await fetch(
        `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      )
      if (playlistRes.ok) {
        const playlist = await playlistRes.json()
        playlistOwnerId = playlist.owner?.id || null
        console.log(`Playlist owner: ${playlist.owner?.display_name || playlist.owner?.id} (${playlistOwnerId})`)
        
        if (tokenUserId && playlistOwnerId && tokenUserId !== playlistOwnerId) {
          console.log(`⚠ WARNING: Token user (${tokenUserId}) is not playlist owner (${playlistOwnerId})`)
        }
      }
    } catch (e) {
      console.log(`⚠ Could not get playlist info: ${e}`)
    }

    // 3 – Search and add each song
    const added: { song: string; spotifyName: string; artist: string; uri: string }[] = []
    const failed: { song: string; guest: string; reason: string; debug?: SearchDebug }[] = []

    for (const { guestName, song } of notionSongs) {
      console.log(`\nProcessing: "${song}" (guest: ${guestName})`)

      const debug: SearchDebug = { queries: [], attempts: [] }
      const result = await searchTrack(searchToken, song, debug)

      if (!result) {
        console.log(`  ✗ Not found on Spotify`)
        failed.push({ song, guest: guestName, reason: 'Not found on Spotify', debug })
        continue
      }

      console.log(`  ✓ Found: "${result.name}" by ${result.artist} → ${result.uri}`)

      const addRes = await fetch(
        `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [result.uri], position: 0 }),
        },
      )

      if (!addRes.ok) {
        let errText = await addRes.text()
        let errJson: any = null
        try {
          errJson = JSON.parse(errText)
        } catch (e) {
          // Not JSON, use as text
        }
        
        console.log(`  ✗ Failed to add: ${errText}`)
        console.log(`  Playlist ID: ${PLAYLIST_ID}`)
        console.log(`  Track URI: ${result.uri}`)
        
        let reason = `Playlist add error: ${addRes.status}`
        let detailedError = errText.substring(0, 500)
        
        if (addRes.status === 403) {
          const errorMsg = errJson?.error?.message || errText
          
          // Check if token user doesn't match playlist owner
          if (tokenUserId && playlistOwnerId && tokenUserId !== playlistOwnerId) {
            reason = `403 Forbidden: Spotify API only allows playlist OWNERS to add tracks, not collaborators. Token user (${tokenUserId}) is not the playlist owner (${playlistOwnerId}). You must use the playlist owner's refresh token. See docs/SPOTIFY_COLLABORATOR_SOLUTION.md for solutions.`
            detailedError = `Token user ID: ${tokenUserId}, Playlist owner ID: ${playlistOwnerId}. Spotify API limitation: only owners can add tracks via API, even if you are a collaborator.`
          } else {
            reason = `403 Forbidden: ${errorMsg}. The refresh token may not have permission to edit this playlist. Only playlist owners can add tracks via Spotify API.`
            detailedError = `Full error: ${errText.substring(0, 500)}`
          }
        } else if (addRes.status === 404) {
          reason = `404 Not Found: Playlist ID may be incorrect or playlist doesn't exist. Check PLAYLIST_ID=${PLAYLIST_ID}`
        }
        
        failed.push({ 
          song, 
          guest: guestName, 
          reason, 
          debug: { 
            ...debug, 
            addError: detailedError,
            playlistId: PLAYLIST_ID,
            trackUri: result.uri,
            httpStatus: addRes.status,
            errorJson: errJson,
          } 
        })
      } else {
        console.log(`  ✓ Added to playlist!`)
        added.push({ song, spotifyName: result.name, artist: result.artist, uri: result.uri })
      }
    }

    // Check if we have 403 errors (from search or playlist add)
    const has403Errors = failed.some(f => 
      f.debug?.attempts?.some((a: any) => a.status === 403) ||
      f.reason?.includes('403')
    )
    
    let message = 'Migration complete'
    let instructions: string[] | undefined
    
    // Check if 403 errors are from playlist add (different issue than search)
    const hasPlaylist403Errors = failed.some(f => f.reason?.includes('403 Forbidden'))
    
    if (hasPlaylist403Errors && added.length === 0) {
      message = 'Migration failed: Cannot add songs to playlist (403 Forbidden)'
      
      // Check if it's a collaborator issue
      const firstFailed = failed.find(f => f.reason?.includes('403'))
      const isCollaboratorIssue = firstFailed?.debug?.trackUri && tokenUserId && playlistOwnerId && tokenUserId !== playlistOwnerId
      
      if (isCollaboratorIssue) {
        instructions = [
          '⚠️ Spotify API Limitation: Only playlist OWNERS can add tracks via API.',
          'Even if you are a collaborator, you cannot add tracks programmatically.',
          '',
          'Solutions:',
          '1. Use playlist owner\'s refresh token (Recommended):',
          '   → Have the playlist owner go to /api/spotify-auth?setup=true',
          '   → They authorize with their account',
          '   → Copy their refresh token',
          '   → Update SPOTIFY_REFRESH_TOKEN in Vercel',
          '',
          '2. Transfer playlist ownership to your account',
          '',
          '3. Create a new playlist that you own',
          '',
          'See docs/SPOTIFY_COLLABORATOR_SOLUTION.md for detailed instructions.',
        ]
      } else {
        instructions = [
          'The refresh token does not have permission to edit the playlist.',
          'Possible causes:',
          '1. Refresh token was generated with OLD credentials - regenerate it:',
          '   → Go to /api/spotify-auth?setup=true',
          '   → Authorize with the NEW app credentials',
          '   → Copy the new refresh token',
          '   → Update SPOTIFY_REFRESH_TOKEN in Vercel',
          '2. The Spotify account does not own the playlist',
          '   → Only playlist owners can add tracks via API',
          '   → See docs/SPOTIFY_COLLABORATOR_SOLUTION.md if you are a collaborator',
          '3. The user is not added to the app\'s user list',
          '   → Go to Dashboard → Your App → Settings → Users Management',
          '   → Add your Spotify account email',
        ]
      }
    } else if (has403Errors && added.length === 0) {
      message = 'Migration failed: Spotify API returned 403 errors'
      instructions = [
        'Your Spotify app is in Development mode and needs users added.',
        '1. Go to https://developer.spotify.com/dashboard',
        '2. Select your app → Edit Settings',
        '3. Add your Spotify account email to "Users and Access"',
        '4. Wait 1-2 minutes and try again',
        'See docs/SPOTIFY_403_SOLUTION.md for details',
      ]
    } else if (has403Errors || hasPlaylist403Errors) {
      message = 'Migration partially complete: Some songs failed due to 403 errors'
      instructions = [
        hasPlaylist403Errors 
          ? 'Some songs could not be added to playlist. Regenerate refresh token with new credentials.'
          : 'Some searches failed with 403. Add users to your Spotify app.',
        'See docs/SPOTIFY_403_SOLUTION.md for details',
      ]
    }

    return res.status(200).json({
      success: !has403Errors || added.length > 0,
      message,
      total: notionSongs.length,
      added: added.length,
      failed: failed.length,
      addedSongs: added,
      failedSongs: failed,
      instructions,
      debug: {
        tokenTest: 'passed',
        searchTokenLength: searchToken.length,
        userTokenLength: userToken.length,
        has403Errors,
      },
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
