import type { VercelRequest, VercelResponse } from '@vercel/node'

const GUESTS_DATABASE_ID = (process.env.NOTION_GUESTS_DATABASE_ID || '').trim().replace(/-/g, '')
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

// Get first text from a Notion property (title or rich_text)
function getPropText(prop: any): string {
  if (!prop) return ''
  if (prop.title && Array.isArray(prop.title)) return prop.title.map((t: any) => t.plain_text || '').join('').trim()
  if (prop.rich_text && Array.isArray(prop.rich_text)) return prop.rich_text.map((t: any) => t.plain_text || '').join('').trim()
  return ''
}

// Parse guest data from Notion page — supports exact names (Name, Code) and fallback by type
function parseGuest(page: any): GuestData | null {
  try {
    const props = page.properties || {}

    let name = getPropText(props.Name) || getPropText(props.Nombre) || ''
    let code = getPropText(props.Code) || getPropText(props.Código) || getPropText(props.codigo) || ''

    if (!name || !code) {
      for (const [key, val] of Object.entries(props)) {
        const p = val as any
        if (p?.title && !name) name = getPropText(p)
        if (p?.rich_text && !code) code = getPropText(p)
        if (name && code) break
      }
    }

    if (!name || !code) return null

    return {
      id: page.id,
      name,
      code: code.toUpperCase(),
      plusOneAllowed: props.PlusOneAllowed?.checkbox === true,
      plusOneName: getPropText(props.PlusOneName) || null,
      hasConfirmed: props.HasConfirmed?.checkbox === true,
      attendance: (props.Attendance?.select?.name || 'pending').toLowerCase(),
      totalGuests: typeof props.TotalGuests?.number === 'number' ? props.TotalGuests.number : 1,
      song: getPropText(props.Song) || null,
      email: props.Email?.email || null,
    }
  } catch (error) {
    console.error('Error parsing guest:', error)
    return null
  }
}

// Find guest by code — tries lowercase, uppercase and original
async function findGuestByCode(code: string): Promise<GuestData | null> {
  const trimmed = code.trim()
  const variants = [...new Set([trimmed, trimmed.toUpperCase(), trimmed.toLowerCase()])]

  console.log(`[guest] findGuestByCode called with: "${trimmed}", variants: ${JSON.stringify(variants)}`)
  console.log(`[guest] Using DB ID: "${GUESTS_DATABASE_ID}"`)

  for (const variant of variants) {
    try {
      const response = await fetch(`https://api.notion.com/v1/databases/${GUESTS_DATABASE_ID}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: 'Code',
            rich_text: { equals: variant },
          },
        }),
      })

      const text = await response.text()
      console.log(`[guest] Query variant="${variant}" → HTTP ${response.status}: ${text.slice(0, 300)}`)

      if (!response.ok) continue

      const data = JSON.parse(text)
      if (data.results && data.results.length > 0) {
        const guest = parseGuest(data.results[0])
        if (guest) {
          console.log(`[guest] Found guest for variant "${variant}"`)
          return guest
        }
        console.log(`[guest] Parse failed for variant "${variant}" (check property names in Notion)`)
      }
      console.log(`[guest] No results for variant "${variant}"`)
    } catch (e: any) {
      console.log(`[guest] Exception for variant "${variant}": ${e.message}`)
    }
  }

  console.log(`[guest] No guest found for code "${trimmed}"`)
  return null
}

// Update guest in Notion
async function updateGuest(
  pageId: string,
  updates: {
    hasConfirmed?: boolean
    attendance?: string
    totalGuests?: number
    song?: string
    plusOneName?: string | null
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
  if (updates.plusOneName !== undefined) {
    if (updates.plusOneName) {
      properties.PlusOneName = {
        rich_text: [{ type: 'text', text: { content: updates.plusOneName } }],
      }
    } else {
      // Clear the field if empty
      properties.PlusOneName = { rich_text: [] }
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

      // If no code provided (e.g. initial load checking cookie), return 200 so client doesn't see a failed request
      if (!code || typeof code !== 'string') {
        return res.status(200).json({ success: false, error: 'Code is required' })
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
      const { code, attendance, totalGuests, song, plusOneName } = req.body

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
        plusOneName: plusOneName || null,
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
