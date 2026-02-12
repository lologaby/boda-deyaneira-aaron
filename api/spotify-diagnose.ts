import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Diagnostic endpoint to test Spotify tokens and identify the 403 issue
 */

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ''
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ''
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN || ''

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

async function getRefreshToken(): Promise<string> {
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
    clientId: CLIENT_ID ? `${CLIENT_ID.substring(0, 10)}...` : 'NOT SET',
    clientSecret: CLIENT_SECRET ? 'SET' : 'NOT SET',
    refreshToken: REFRESH_TOKEN ? `${REFRESH_TOKEN.substring(0, 20)}...` : 'NOT SET',
    tests: [],
  }

  // Test 1: Client Credentials Token
  try {
    const ccToken = await getClientCredentialsToken()
    results.tests.push({
      name: 'Client Credentials Token',
      status: 'success',
      token: `${ccToken.substring(0, 20)}...`,
    })

    // Test search with client credentials
    const searchRes = await fetch(
      'https://api.spotify.com/v1/search?q=Mil+Mujeres+Rauw+Alejandro&type=track&limit=1',
      { headers: { Authorization: `Bearer ${ccToken}` } }
    )
    results.tests.push({
      name: 'Search with Client Credentials',
      status: searchRes.ok ? 'success' : 'failed',
      httpStatus: searchRes.status,
      response: searchRes.ok ? 'OK' : await searchRes.text(),
    })
  } catch (e: any) {
    results.tests.push({
      name: 'Client Credentials Token',
      status: 'failed',
      error: e.message,
    })
  }

  // Test 2: Refresh Token
  try {
    const refreshToken = await getRefreshToken()
    results.tests.push({
      name: 'Refresh Token',
      status: 'success',
      token: `${refreshToken.substring(0, 20)}...`,
    })

    // Test search with refresh token
    const searchRes = await fetch(
      'https://api.spotify.com/v1/search?q=Mil+Mujeres+Rauw+Alejandro&type=track&limit=1',
      { headers: { Authorization: `Bearer ${refreshToken}` } }
    )
    
    let responseData: any
    if (searchRes.ok) {
      try {
        responseData = await searchRes.json()
        responseData = { total: responseData?.tracks?.total || 0, items: responseData?.tracks?.items?.length || 0 }
      } catch (e) {
        responseData = 'OK but failed to parse JSON'
      }
    } else {
      // Spotify returns text/plain for errors, not JSON
      responseData = await searchRes.text()
    }
    
    results.tests.push({
      name: 'Search with Refresh Token',
      status: searchRes.ok ? 'success' : 'failed',
      httpStatus: searchRes.status,
      response: responseData,
    })
  } catch (e: any) {
    results.tests.push({
      name: 'Refresh Token',
      status: 'failed',
      error: e.message,
    })
  }

  return res.status(200).json(results)
}
