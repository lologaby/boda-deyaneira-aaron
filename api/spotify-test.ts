import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Test endpoint to verify Spotify API is working
 * Visit: /api/spotify-test?q=Mil+Mujeres+Rauw+Alejandro
 */

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ''
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ''

async function getToken(): Promise<string> {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!r.ok) throw new Error(`Token failed: ${r.status}`)
  return ((await r.json()) as any).access_token
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  const query = req.query.q as string || 'Mil Mujeres Rauw Alejandro'

  try {
    const token = await getToken()
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5&market=US`
    
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    
    if (!r.ok) {
      const err = await r.text()
      return res.status(500).json({ success: false, error: `API error ${r.status}: ${err}` })
    }

    const data = await r.json()
    
    return res.status(200).json({
      success: true,
      query,
      token: token.substring(0, 20) + '...',
      total: data?.tracks?.total || 0,
      items: data?.tracks?.items?.length || 0,
      tracks: (data?.tracks?.items || []).map((t: any) => ({
        name: t.name,
        artist: t.artists?.[0]?.name,
        uri: t.uri,
        id: t.id,
      })),
      raw: data,
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}
