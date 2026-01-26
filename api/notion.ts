import type { VercelRequest, VercelResponse } from '@vercel/node'

const DATABASE_ID = process.env.NOTION_DATABASE_ID || ''
const PAGE_ID = process.env.NOTION_PAGE_ID || ''
const NOTION_API_KEY = process.env.NOTION_API_KEY || ''

const NOTION_VERSION = '2022-06-28'

interface NotionPhoto {
  id: string
  url: string
  caption?: string
}

interface GalleryContent {
  message: string
  photos: NotionPhoto[]
  lastUpdated: string
}

// Make a request to Notion API
async function notionFetch(endpoint: string, body?: any) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Notion API error: ${response.status} - ${error}`)
  }
  
  return response.json()
}

// Extract text from Notion rich text array
function extractText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return ''
  return richText.map((t: any) => t.plain_text || '').join('')
}

// Get the couple's message from a Notion page
async function getCoupleMessage(): Promise<string> {
  if (!PAGE_ID) return ''
  
  try {
    const data = await notionFetch(`/blocks/${PAGE_ID}/children?page_size=50`)
    
    let message = ''
    for (const block of data.results || []) {
      if (block.type === 'paragraph' && block.paragraph?.rich_text) {
        const text = extractText(block.paragraph.rich_text)
        if (text) message += text + '\n\n'
      } else if (block.type === 'heading_1' && block.heading_1?.rich_text) {
        const text = extractText(block.heading_1.rich_text)
        if (text) message += `# ${text}\n\n`
      } else if (block.type === 'heading_2' && block.heading_2?.rich_text) {
        const text = extractText(block.heading_2.rich_text)
        if (text) message += `## ${text}\n\n`
      } else if (block.type === 'quote' && block.quote?.rich_text) {
        const text = extractText(block.quote.rich_text)
        if (text) message += `> ${text}\n\n`
      }
    }

    return message.trim()
  } catch (error) {
    console.error('Error fetching message:', error)
    return ''
  }
}

// Get photos from a Notion database (gallery)
async function getPhotos(): Promise<{ photos: NotionPhoto[], debug?: any }> {
  if (!DATABASE_ID) return { photos: [], debug: { error: 'No DATABASE_ID configured' } }

  try {
    const data = await notionFetch(`/databases/${DATABASE_ID}/query`, {
      sorts: [
        {
          property: 'Order',
          direction: 'ascending',
        },
      ],
    })

    const photos: NotionPhoto[] = []
    const debugInfo: any[] = []

    for (const page of data.results || []) {
      const properties = page.properties || {}

      // Debug: log all property names and types
      const propDebug: any = {
        pageId: page.id,
        propertyNames: Object.keys(properties),
        properties: {}
      }

      for (const [key, value] of Object.entries(properties)) {
        const val = value as any
        propDebug.properties[key] = {
          type: val.type,
          hasFiles: val.files?.length > 0,
          filesCount: val.files?.length || 0
        }
      }

      // Try to get image from "Image" or "Foto" property (file type)
      let imageUrl = ''
      let caption = ''

      // Check for file property named "Image", "Foto", or "Photo"
      const imageProperty = properties.Image || properties.Foto || properties.Photo
      propDebug.imagePropertyFound = !!imageProperty
      propDebug.imagePropertyType = (imageProperty as any)?.type

      if ((imageProperty as any)?.files?.[0]) {
        const file = (imageProperty as any).files[0]
        imageUrl = file.file?.url || file.external?.url || ''
        propDebug.fileData = {
          hasFileUrl: !!file.file?.url,
          hasExternalUrl: !!file.external?.url,
          fileType: file.type
        }
      }

      // Check for cover image as fallback
      if (!imageUrl && page.cover) {
        imageUrl = (page.cover as any).file?.url || (page.cover as any).external?.url || ''
        propDebug.usedCover = true
      }

      // Get caption from "Caption", "Descripcion", or "Name" property
      const captionProperty = properties.Caption || properties.Descripcion || properties.Name
      if ((captionProperty as any)?.title) {
        caption = extractText((captionProperty as any).title)
      } else if ((captionProperty as any)?.rich_text) {
        caption = extractText((captionProperty as any).rich_text)
      }

      propDebug.finalImageUrl = imageUrl ? 'found' : 'not found'
      debugInfo.push(propDebug)

      if (imageUrl) {
        photos.push({
          id: page.id,
          url: imageUrl,
          caption: caption || undefined,
        })
      }
    }

    return { 
      photos, 
      debug: { 
        databaseId: DATABASE_ID,
        totalResults: data.results?.length || 0,
        pages: debugInfo 
      } 
    }
  } catch (error: any) {
    console.error('Error fetching photos:', error)
    return { photos: [], debug: { error: error.message } }
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  // Check if API key is configured
  if (!NOTION_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Notion API key not configured',
    })
  }

  try {
    const [message, photosResult] = await Promise.all([
      getCoupleMessage(),
      getPhotos(),
    ])

    const content: GalleryContent = {
      message,
      photos: photosResult.photos,
      lastUpdated: new Date().toISOString(),
    }

    // Include debug info if requested
    const includeDebug = req.query.debug === 'true'

    // Cache for 5 minutes (disabled for debug)
    if (!includeDebug) {
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    } else {
      res.setHeader('Cache-Control', 'no-cache')
    }

    return res.status(200).json({
      success: true,
      data: content,
      ...(includeDebug && { debug: photosResult.debug }),
    })
  } catch (error: any) {
    console.error('Notion API error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch content from Notion',
    })
  }
}
