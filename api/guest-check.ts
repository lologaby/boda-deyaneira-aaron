import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Diagnostic endpoint: open https://tu-sitio.com/api/guest-check
 * When codes stop working, this shows the real reason (missing env, Notion not shared, etc.).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  const NOTION_API_KEY = (process.env.NOTION_API_KEY || '').trim()
  const DB_ID_RAW = (process.env.NOTION_GUESTS_DATABASE_ID || '').trim()
  const GUESTS_DATABASE_ID = DB_ID_RAW.replace(/-/g, '')

  const out: { ok: boolean; checks: Record<string, string>; nextStep?: string } = {
    ok: false,
    checks: {},
  }

  if (!NOTION_API_KEY) {
    out.checks.notionApiKey = 'Missing. Add NOTION_API_KEY in Vercel → Settings → Environment Variables.'
    out.nextStep = 'Create a Notion integration at notion.so/my-integrations, copy the secret, add it as NOTION_API_KEY.'
    return res.status(200).json(out)
  }
  out.checks.notionApiKey = 'Set'

  if (!GUESTS_DATABASE_ID) {
    out.checks.guestsDbId = 'Missing. Add NOTION_GUESTS_DATABASE_ID (the ID from your Notion guest database URL).'
    out.nextStep = 'In Notion, open the guest database, copy the ID from the URL: notion.so/[THIS_PART]?v=...'
    return res.status(200).json(out)
  }
  out.checks.guestsDbId = `Set (${GUESTS_DATABASE_ID.slice(0, 8)}...)`

  try {
    const r = await fetch(`https://api.notion.com/v1/databases/${GUESTS_DATABASE_ID}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
      },
    })

    if (r.status === 401) {
      out.checks.notionConnection = 'Invalid API key (401).'
      out.nextStep = 'Regenerate the secret in notion.so/my-integrations and update NOTION_API_KEY in Vercel.'
      return res.status(200).json(out)
    }

    if (r.status === 404) {
      out.checks.notionConnection = 'Database not found (404). Wrong ID or database not shared with the integration.'
      out.nextStep = 'In Notion: open the guest database → ⋯⋮ (top right) → Add connections → select your integration.'
      return res.status(200).json(out)
    }

    if (r.status === 403) {
      const body = await r.text()
      out.checks.notionConnection = `Forbidden (403). ${body.slice(0, 200)}`
      out.nextStep = 'In Notion: open the guest database → ⋯⋮ → Add connections → select your integration.'
      return res.status(200).json(out)
    }

    if (!r.ok) {
      out.checks.notionConnection = `Notion returned ${r.status}: ${await r.text()}`
      return res.status(200).json(out)
    }

    const db = await r.json()
    const title = db.title?.[0]?.plain_text || 'Untitled'
    out.checks.notionConnection = `OK. Database: "${title}"`
    out.ok = true
  } catch (e: any) {
    out.checks.notionConnection = `Request failed: ${e?.message || String(e)}`
    out.nextStep = 'Check Vercel logs and that NOTION_API_KEY and NOTION_GUESTS_DATABASE_ID are set for this environment.'
  }

  return res.status(200).json(out)
}
