import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Diagnostic endpoint: open https://tu-sitio.com/api/guest-check
 * Returns JSON showing whether Notion is reachable and configured correctly.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  try {
    const NOTION_API_KEY = (process.env.NOTION_API_KEY || '').trim()
    const DB_ID_RAW = (process.env.NOTION_GUESTS_DATABASE_ID || '').trim()
    const GUESTS_DATABASE_ID = DB_ID_RAW.replace(/-/g, '')

    const result: Record<string, any> = {
      ok: false,
      nodeVersion: process.version,
      env: {
        NOTION_API_KEY: NOTION_API_KEY ? `Set (${NOTION_API_KEY.slice(0, 10)}...)` : 'MISSING',
        NOTION_GUESTS_DATABASE_ID: GUESTS_DATABASE_ID
          ? `Set (${GUESTS_DATABASE_ID.slice(0, 8)}...)`
          : 'MISSING',
      },
    }

    if (!NOTION_API_KEY) {
      result.error = 'NOTION_API_KEY is not set in Vercel environment variables.'
      result.fix = 'Go to Vercel → Settings → Environment Variables → add NOTION_API_KEY'
      return res.status(200).json(result)
    }

    if (!GUESTS_DATABASE_ID) {
      result.error = 'NOTION_GUESTS_DATABASE_ID is not set in Vercel environment variables.'
      result.fix = 'Go to Vercel → Settings → Environment Variables → add NOTION_GUESTS_DATABASE_ID = 2f4906e5c03a80769a1beae40d5b4f7b'
      return res.status(200).json(result)
    }

    // Test Notion API connection
    const notionRes = await fetch(`https://api.notion.com/v1/databases/${GUESTS_DATABASE_ID}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    })

    const body = await notionRes.text()

    result.notionStatus = notionRes.status

    if (notionRes.status === 200) {
      let db: any = {}
      try { db = JSON.parse(body) } catch {}
      const title = db?.title?.[0]?.plain_text || '(no title)'
      result.ok = true
      result.database = title
      result.message = `Notion OK. Database: "${title}". Codes should work.`
      return res.status(200).json(result)
    }

    if (notionRes.status === 401) {
      result.error = 'Invalid NOTION_API_KEY (Notion returned 401).'
      result.fix = 'Regenerate the secret at notion.so/my-integrations and update NOTION_API_KEY in Vercel.'
      return res.status(200).json(result)
    }

    if (notionRes.status === 404) {
      result.error = 'Database not found (Notion returned 404). Wrong ID or integration not connected to the database.'
      result.fix = 'In Notion: open the guest database → ··· (top right) → Add connections → select your integration. Also verify the ID in NOTION_GUESTS_DATABASE_ID.'
      return res.status(200).json(result)
    }

    if (notionRes.status === 403) {
      result.error = `Forbidden (Notion returned 403). Integration not connected to this database.`
      result.fix = 'In Notion: open the guest database → ··· (top right) → Add connections → select your integration.'
      result.notionBody = body.slice(0, 300)
      return res.status(200).json(result)
    }

    result.error = `Unexpected Notion response: ${notionRes.status}`
    result.notionBody = body.slice(0, 300)
    return res.status(200).json(result)

  } catch (err: any) {
    return res.status(200).json({
      ok: false,
      crashed: true,
      error: err?.message || String(err),
      stack: err?.stack?.slice(0, 500),
    })
  }
}
