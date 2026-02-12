import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Test endpoint to diagnose playlist add issues
 */

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ''
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ''
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN || ''
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID || '3v2Zl4aSJgAPMlkxv9FZzS'

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
    throw new Error(`Refresh token failed ${r.status}: ${t}`)
  }
  return ((await r.json()) as any).access_token
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  const results: any = {
    config: {
      clientId: CLIENT_ID ? `${CLIENT_ID.substring(0, 10)}...` : 'NOT SET',
      playlistId: PLAYLIST_ID,
      refreshToken: REFRESH_TOKEN ? `${REFRESH_TOKEN.substring(0, 20)}...` : 'NOT SET',
    },
    tests: [],
  }

  try {
    // Test 1: Get user token
    const userToken = await getUserToken()
    results.tests.push({
      name: 'Get Refresh Token',
      status: 'success',
      token: `${userToken.substring(0, 20)}...`,
    })

    // Test 2: Get user profile (verify token works)
    const profileRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${userToken}` }
    })
    
    if (profileRes.ok) {
      const profile = await profileRes.json()
      results.tests.push({
        name: 'Get User Profile',
        status: 'success',
        userId: profile.id,
        displayName: profile.display_name,
        email: profile.email,
      })
    } else {
      const err = await profileRes.text()
      results.tests.push({
        name: 'Get User Profile',
        status: 'failed',
        httpStatus: profileRes.status,
        error: err,
      })
    }

    // Test 3: Get playlist info (verify playlist exists and user has access)
    const playlistRes = await fetch(
      `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}`,
      { headers: { Authorization: `Bearer ${userToken}` } }
    )

    if (playlistRes.ok) {
      const playlist = await playlistRes.json()
      const playlistInfo = {
        name: 'Get Playlist Info',
        status: 'success' as const,
        playlistName: playlist.name,
        ownerId: playlist.owner?.id,
        ownerDisplayName: playlist.owner?.display_name,
        isPublic: playlist.public,
        collaborative: playlist.collaborative,
        tracksTotal: playlist.tracks?.total,
      }
      
      // Check if token user matches playlist owner
      const tokenUserId = results.tests.find((t: any) => t.name === 'Get User Profile')?.userId
      if (tokenUserId && playlist.owner?.id && tokenUserId !== playlist.owner.id) {
        playlistInfo.status = 'warning' as any
        results.recommendation = {
          issue: 'Token user does not own the playlist',
          tokenUserId,
          tokenUserName: results.tests.find((t: any) => t.name === 'Get User Profile')?.displayName,
          playlistOwnerId: playlist.owner.id,
          playlistOwnerName: playlist.owner.display_name,
          solution: `The refresh token was generated with account "${results.tests.find((t: any) => t.name === 'Get User Profile')?.displayName}" but the playlist belongs to "${playlist.owner.display_name}". You must generate a new refresh token using the playlist owner's account (${playlist.owner.display_name}).`,
        }
      }
      
      results.tests.push(playlistInfo)
    } else {
      const err = await playlistRes.text()
      results.tests.push({
        name: 'Get Playlist Info',
        status: 'failed',
        httpStatus: playlistRes.status,
        error: err,
      })
    }

    // Test 4: Try to add a test track (use a popular track that definitely exists)
    const testTrackUri = 'spotify:track:4uLU6hMCjMI75M1A2tKUQC5' // "Never Gonna Give You Up" by Rick Astley
    const addRes = await fetch(
      `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [testTrackUri], position: 0 }),
      },
    )

    if (addRes.ok) {
      const addData = await addRes.json()
      results.tests.push({
        name: 'Add Track to Playlist',
        status: 'success',
        snapshotId: addData.snapshot_id,
        message: 'Track added successfully!',
      })
      
      // Remove it immediately to not clutter the playlist
      setTimeout(async () => {
        await fetch(
          `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${userToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uris: [testTrackUri] }),
          },
        )
      }, 2000)
    } else {
      const errText = await addRes.text()
      let errJson: any = null
      try {
        errJson = JSON.parse(errText)
      } catch (e) {
        // Not JSON
      }
      
      const tokenUserId = results.tests.find((t: any) => t.name === 'Get User Profile')?.userId
      const playlistOwnerId = results.tests.find((t: any) => t.name === 'Get Playlist Info')?.ownerId
      
      let solution = ''
      if (addRes.status === 403 && tokenUserId && playlistOwnerId && tokenUserId !== playlistOwnerId) {
        solution = `The token user (${results.tests.find((t: any) => t.name === 'Get User Profile')?.displayName}) is not the playlist owner (${results.tests.find((t: any) => t.name === 'Get Playlist Info')?.ownerDisplayName}). Generate a new refresh token using the playlist owner's account.`
      } else if (addRes.status === 403) {
        solution = '403 Forbidden: The token does not have permission to edit this playlist. Make sure the playlist is collaborative or the token user owns the playlist.'
      }
      
      results.tests.push({
        name: 'Add Track to Playlist',
        status: 'failed',
        httpStatus: addRes.status,
        error: errText,
        errorJson: errJson,
        trackUri: testTrackUri,
        solution,
      })
    }

  } catch (error: any) {
    results.tests.push({
      name: 'General Error',
      status: 'failed',
      error: error.message,
    })
  }

  return res.status(200).json(results)
}
