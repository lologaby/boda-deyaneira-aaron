import type { VercelRequest, VercelResponse } from '@vercel/node'

const GUESTS_DATABASE_ID = process.env.NOTION_GUESTS_DATABASE_ID || ''
const NOTION_API_KEY = process.env.NOTION_API_KEY || ''
const NOTION_VERSION = '2022-06-28'

interface GuestData {
  id: string
  name: string
  code: string
  plusOneAllowed: boolean
  plusOneName: string | null
  hasConfirmed: boolean
  attendance: 'pending' | 'yes' | 'no'
  totalGuests: number
  song: string | null
  email: string | null
}

// Make a request to Notion API
async function notionFetch(endpoint: string, options?: { method?: string; body?: any }) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method: options?.method || 'GET',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    ...(options?.body && { body: JSON.stringify(options.body) }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Notion API error: ${response.status} - ${error}`)
  }

  return response.json()
}

// Extract plain text from Notion rich text
function extractText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return ''
  return richText.map((t: any) => t.plain_text || '').join('')
}

// Parse guest data from Notion page
function parseGuest(page: any): GuestData | null {
  try {
    const props = page.properties

    const name = extractText(props.Name?.title) || ''
    const code = props.Code?.rich_text ? extractText(props.Code.rich_text) : ''
    
    if (!name || !code) return null

    return {
      id: page.id,
      name,
      code: code.toUpperCase(),
      plusOneAllowed: props.PlusOneAllowed?.checkbox || false,
      plusOneName: props.PlusOneName?.rich_text ? extractText(props.PlusOneName.rich_text) || null : null,
      hasConfirmed: props.HasConfirmed?.checkbox || false,
      attendance: props.Attendance?.select?.name?.toLowerCase() || 'pending',
      totalGuests: props.TotalGuests?.number || 1,
      song: props.Song?.rich_text ? extractText(props.Song.rich_text) || null : null,
      email: props.Email?.email || null,
    }
  } catch (error) {
    console.error('Error parsing guest:', error)
    return null
  }
}

// Find guest by code
async function findGuestByCode(code: string): Promise<GuestData | null> {
  const normalizedCode = code.toUpperCase().trim()

  const data = await notionFetch(`/databases/${GUESTS_DATABASE_ID}/query`, {
    method: 'POST',
    body: {
      filter: {
        property: 'Code',
        rich_text: {
          equals: normalizedCode,
        },
      },
    },
  })

  if (!data.results || data.results.length === 0) {
    return null
  }

  return parseGuest(data.results[0])
}

// Update guest in Notion
async function updateGuest(
  pageId: string,
  updates: {
    hasConfirmed?: boolean
    attendance?: string
    totalGuests?: number
    song?: string
  }
): Promise<boolean> {
  const properties: any = {}

  if (updates.hasConfirmed !== undefined) {
    properties.HasConfirmed = { checkbox: updates.hasConfirmed }
  }
  if (updates.attendance !== undefined) {
    properties.Attendance = { select: { name: updates.attendance } }
  }
  if (updates.totalGuests !== undefined) {
    properties.TotalGuests = { number: updates.totalGuests }
  }
  if (updates.song !== undefined) {
    properties.Song = {
      rich_text: [{ type: 'text', text: { content: updates.song } }],
    }
  }

  await notionFetch(`/pages/${pageId}`, {
    method: 'PATCH',
    body: { properties },
  })

  return true
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Check configuration
  if (!NOTION_API_KEY) {
    return res.status(500).json({ success: false, error: 'Notion API not configured' })
  }

  if (!GUESTS_DATABASE_ID) {
    return res.status(500).json({ success: false, error: 'Guests database not configured' })
  }

  try {
    // GET: Validate code and get guest info (or check cookie)
    if (req.method === 'GET') {
      const { code, logout } = req.query
      
      // Handle logout
      if (logout === 'true') {
        res.setHeader('Set-Cookie', 'guest_code=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly')
        return res.status(200).json({ success: true, message: 'Logged out' })
      }
      
      // First, check if there's a valid cookie
      // In Vercel, cookies are available in req.cookies
      const cookieCode = (req.cookies && typeof req.cookies === 'object' && 'guest_code' in req.cookies)
        ? req.cookies.guest_code
        : null
      
      if (cookieCode && !code) {
        // User has a cookie, validate it
        const guest = await findGuestByCode(cookieCode)
        if (guest) {
          return res.status(200).json({
            success: true,
            guest,
            fromCookie: true,
          })
        }
        // Invalid cookie, clear it
        res.setHeader('Set-Cookie', 'guest_code=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly')
      }

      // If code provided, validate it
      if (!code || typeof code !== 'string') {
        // No code and no valid cookie
        if (!cookieCode) {
          return res.status(400).json({ success: false, error: 'Code is required' })
        }
        return res.status(400).json({ success: false, error: 'Code is required' })
      }

      const guest = await findGuestByCode(code)

      if (!guest) {
        return res.status(404).json({ success: false, error: 'Invalid code' })
      }

      // Mark as "pending" if attendance is not yet set (first time entering code)
      if (guest.attendance === 'pending' || !guest.hasConfirmed) {
        await updateGuest(guest.id, {
          attendance: 'pending',
        })
        // Refresh guest data
        const updatedGuest = await findGuestByCode(code)
        if (updatedGuest) {
          Object.assign(guest, updatedGuest)
        }
      }

      // Set cookie for future visits (30 days) - one time magic!
      const cookieValue = code.toUpperCase().trim()
      const cookieOptions = [
        `guest_code=${cookieValue}`,
        'Path=/',
        'Max-Age=2592000', // 30 days
        'SameSite=Lax',
        process.env.NODE_ENV === 'production' ? 'Secure' : '',
        'HttpOnly',
      ].filter(Boolean).join('; ')

      res.setHeader('Set-Cookie', cookieOptions)

      return res.status(200).json({
        success: true,
        guest,
      })
    }

    // PATCH: Update guest RSVP
    if (req.method === 'PATCH') {
      const { code, attendance, totalGuests, song } = req.body

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ success: false, error: 'Code is required' })
      }

      const guest = await findGuestByCode(code)

      if (!guest) {
        return res.status(404).json({ success: false, error: 'Invalid code' })
      }

      // Update the guest
      await updateGuest(guest.id, {
        hasConfirmed: true,
        attendance: attendance || 'yes',
        totalGuests: totalGuests || 1,
        song: song || '',
      })

      return res.status(200).json({
        success: true,
        message: 'RSVP updated successfully',
      })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Guest API error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    })
  }
}
