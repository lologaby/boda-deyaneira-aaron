import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Test endpoint to diagnose playlist add issues
 */

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ''
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ''
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN || ''
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID || '3Nvj5752VBO0BXTpSm5hkH'

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

    // Test 2: Get user profile (verify token works and check scopes)
    const profileRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${userToken}` }
    })
    
    if (profileRes.ok) {
      const profile = await profileRes.json()
      // Note: Spotify doesn't return scopes in /me endpoint, but we can infer from what works
      results.tests.push({
        name: 'Get User Profile',
        status: 'success',
        userId: profile.id,
        displayName: profile.display_name,
        email: profile.email,
        note: 'Token is valid. Scopes cannot be verified directly, but will be tested when adding tracks.',
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
          isCollaborative: playlist.collaborative,
          important: 'Spotify API limitation: Only the playlist owner can add tracks via API, even if you are a collaborator.',
          solutions: [
            {
              option: 1,
              title: 'Use owner\'s refresh token (Recommended)',
              steps: [
                `Have "${playlist.owner.display_name}" generate a refresh token:`,
                '1. Go to /api/spotify-auth?setup=true',
                '2. Authorize with their account',
                '3. Copy the refresh token',
                '4. Update SPOTIFY_REFRESH_TOKEN in Vercel',
              ],
            },
            {
              option: 2,
              title: 'Transfer playlist ownership',
              steps: [
                `"${playlist.owner.display_name}" transfers playlist to your account`,
                'Then generate refresh token with your account',
              ],
            },
            {
              option: 3,
              title: 'Create new playlist you own',
              steps: [
                'Create new playlist with your account',
                'Update SPOTIFY_PLAYLIST_ID in Vercel',
                'Generate refresh token with your account',
              ],
            },
          ],
          documentation: 'See docs/SPOTIFY_COLLABORATOR_SOLUTION.md for details',
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
      const playlistInfo = results.tests.find((t: any) => t.name === 'Get Playlist Info')
      
      let solution = ''
      if (addRes.status === 403 && tokenUserId && playlistOwnerId && tokenUserId !== playlistOwnerId) {
        solution = `403 Forbidden: Spotify API only allows playlist OWNERS to add tracks via API, not collaborators. The token user (${results.tests.find((t: any) => t.name === 'Get User Profile')?.displayName}) is not the playlist owner (${playlistInfo?.ownerDisplayName}). You must use the playlist owner's refresh token. See docs/SPOTIFY_COLLABORATOR_SOLUTION.md for solutions.`
      } else if (addRes.status === 403 && tokenUserId && playlistOwnerId && tokenUserId === playlistOwnerId) {
        solution = `403 Forbidden: Even though you are the playlist owner, the token doesn't have permission. 

CRITICAL: In Development Mode, even the app owner must be added to the user list!

Steps to fix:
1. Go to https://developer.spotify.com/dashboard
2. Click on your app (Client ID: ${CLIENT_ID.substring(0, 10)}...)
3. Click "Edit Settings"
4. Go to "Users Management" tab
5. Click "Add new user"
6. Add your Spotify account email: ${results.tests.find((t: any) => t.name === 'Get User Profile')?.email || 'your-email@example.com'}
7. Enter your display name: ${results.tests.find((t: any) => t.name === 'Get User Profile')?.displayName || 'Dot0x'}
8. Save and wait 1-2 minutes
9. Try again

Also verify:
- Refresh token was generated with CURRENT app credentials (not old ones)
- Token has scopes: playlist-modify-public, playlist-modify-private
- You authorized the app with the correct account`
      } else if (addRes.status === 403) {
        solution = '403 Forbidden: The token does not have permission to edit this playlist. Only playlist owners can add tracks via Spotify API. Regenerate the refresh token at /api/spotify-auth?setup=true'
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
