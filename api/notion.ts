import { Client } from '@notionhq/client'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const DATABASE_ID = process.env.NOTION_DATABASE_ID || ''
const PAGE_ID = process.env.NOTION_PAGE_ID || ''

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

// Extract text from Notion rich text array
function extractText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return ''
  return richText.map((t: any) => t.plain_text || '').join('')
}

// Get the couple's message from a Notion page
async function getCoupleMessage(): Promise<string> {
  if (!PAGE_ID) return ''
  
  try {
    const blocks = await notion.blocks.children.list({
      block_id: PAGE_ID,
      page_size: 50,
    })

    let message = ''
    for (const block of blocks.results) {
      const blockAny = block as any
      if (blockAny.type === 'paragraph' && blockAny.paragraph?.rich_text) {
        const text = extractText(blockAny.paragraph.rich_text)
        if (text) message += text + '\n\n'
      } else if (blockAny.type === 'heading_1' && blockAny.heading_1?.rich_text) {
        const text = extractText(blockAny.heading_1.rich_text)
        if (text) message += `# ${text}\n\n`
      } else if (blockAny.type === 'heading_2' && blockAny.heading_2?.rich_text) {
        const text = extractText(blockAny.heading_2.rich_text)
        if (text) message += `## ${text}\n\n`
      } else if (blockAny.type === 'quote' && blockAny.quote?.rich_text) {
        const text = extractText(blockAny.quote.rich_text)
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
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          property: 'Order',
          direction: 'ascending',
        },
      ],
    })

    const photos: NotionPhoto[] = []
    const debugInfo: any[] = []

    for (const page of response.results) {
      const pageAny = page as any
      const properties = pageAny.properties

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
      propDebug.imagePropertyType = imageProperty?.type

      if (imageProperty?.files?.[0]) {
        const file = imageProperty.files[0]
        imageUrl = file.file?.url || file.external?.url || ''
        propDebug.fileData = {
          hasFileUrl: !!file.file?.url,
          hasExternalUrl: !!file.external?.url,
          fileType: file.type
        }
      }

      // Check for cover image as fallback
      if (!imageUrl && pageAny.cover) {
        imageUrl = pageAny.cover.file?.url || pageAny.cover.external?.url || ''
        propDebug.usedCover = true
      }

      // Get caption from "Caption", "Descripcion", or "Name" property
      const captionProperty = properties.Caption || properties.Descripcion || properties.Name
      if (captionProperty?.title) {
        caption = extractText(captionProperty.title)
      } else if (captionProperty?.rich_text) {
        caption = extractText(captionProperty.rich_text)
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
        totalResults: response.results.length,
        pages: debugInfo 
      } 
    }
  } catch (error: any) {
    console.error('Error fetching photos:', error)
    return { photos: [], debug: { error: error.message, code: error.code } }
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
  if (!process.env.NOTION_API_KEY) {
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
  } catch (error) {
    console.error('Notion API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch content from Notion',
    })
  }
}
