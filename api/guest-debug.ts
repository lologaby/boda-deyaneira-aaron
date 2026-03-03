import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Debug endpoint — shows the first 20 rows of the guest database with their Code values.
 * DELETE this file after debugging.
 * Visit: /api/guest-debug
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  const NOTION_API_KEY = (process.env.NOTION_API_KEY || '').trim()
  const DB_ID = (process.env.NOTION_GUESTS_DATABASE_ID || '').trim().replace(/-/g, '')

  try {
    // Fetch first 20 rows without any filter
    const r = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 20 }),
    })

    const data = await r.json()

    if (!r.ok) {
      return res.status(200).json({ error: data })
    }

    // Extract Name and Code from each row
    const rows = (data.results || []).map((page: any) => {
      const props = page.properties
      const getText = (p: any) => {
        if (!p) return null
        if (p.rich_text) return p.rich_text.map((t: any) => t.plain_text).join('')
        if (p.title) return p.title.map((t: any) => t.plain_text).join('')
        return null
      }

      // Show ALL property names and their types so we can see what exists
      const allProps: Record<string, any> = {}
      for (const [key, val] of Object.entries(props)) {
        const v = val as any
        allProps[key] = {
          type: v.type,
          value: getText(v),
        }
      }

      return {
        id: page.id.slice(0, 8),
        Name: getText(props.Name || props.Nombre),
        Code: getText(props.Code || props.Código || props.codigo),
        allProps,
      }
    })

    return res.status(200).json({
      total: data.results?.length,
      rows,
    })
  } catch (e: any) {
    return res.status(200).json({ crashed: true, error: e.message })
  }
}
