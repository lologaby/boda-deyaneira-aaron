import type { VercelRequest, VercelResponse } from '@vercel/node'

const DATABASE_ID = process.env.NOTION_DATABASE_ID || ''
const PAGE_ID_ES = process.env.NOTION_PAGE_ID || process.env.NOTION_PAGE_ID_ES || ''
const PAGE_ID_EN = process.env.NOTION_PAGE_ID_EN || ''
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

// Extract text from Notion rich text array (plain text, no formatting)
function extractPlainText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return ''
  return richText.map((t: any) => t.plain_text || '').join('')
}

// Convert Notion rich text to HTML with formatting
function richTextToHtml(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return ''
  
  return richText.map((t: any) => {
    let text = t.plain_text || ''
    if (!text) return ''
    
    // Escape HTML entities
    text = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    
    // Apply annotations
    const annotations = t.annotations || {}
    
    if (annotations.code) {
      text = `<code>${text}</code>`
    }
    if (annotations.bold) {
      text = `<strong>${text}</strong>`
    }
    if (annotations.italic) {
      text = `<em>${text}</em>`
    }
    if (annotations.strikethrough) {
      text = `<s>${text}</s>`
    }
    if (annotations.underline) {
      text = `<u>${text}</u>`
    }
    
    // Handle links
    if (t.href) {
      text = `<a href="${t.href}" target="_blank" rel="noopener noreferrer">${text}</a>`
    }
    
    return text
  }).join('')
}

// Get the couple's message from a Notion page (returns HTML)
async function getCoupleMessage(lang: 'es' | 'en' = 'es'): Promise<string> {
  const pageId = lang === 'en' && PAGE_ID_EN ? PAGE_ID_EN : PAGE_ID_ES
  if (!pageId) return ''
  
  try {
    const data = await notionFetch(`/blocks/${pageId}/children?page_size=100`)
    
    const htmlParts: string[] = []
    
    for (const block of data.results || []) {
      const type = block.type
      
      switch (type) {
        case 'paragraph': {
          const html = richTextToHtml(block.paragraph?.rich_text)
          if (html) htmlParts.push(`<p>${html}</p>`)
          break
        }
        case 'heading_1': {
          const html = richTextToHtml(block.heading_1?.rich_text)
          if (html) htmlParts.push(`<h2 class="notion-h1">${html}</h2>`)
          break
        }
        case 'heading_2': {
          const html = richTextToHtml(block.heading_2?.rich_text)
          if (html) htmlParts.push(`<h3 class="notion-h2">${html}</h3>`)
          break
        }
        case 'heading_3': {
          const html = richTextToHtml(block.heading_3?.rich_text)
          if (html) htmlParts.push(`<h4 class="notion-h3">${html}</h4>`)
          break
        }
        case 'quote': {
          const html = richTextToHtml(block.quote?.rich_text)
          if (html) htmlParts.push(`<blockquote class="notion-quote">${html}</blockquote>`)
          break
        }
        case 'callout': {
          const icon = block.callout?.icon?.emoji || '💡'
          const html = richTextToHtml(block.callout?.rich_text)
          if (html) htmlParts.push(`<div class="notion-callout"><span class="notion-callout-icon">${icon}</span><span>${html}</span></div>`)
          break
        }
        case 'bulleted_list_item': {
          const html = richTextToHtml(block.bulleted_list_item?.rich_text)
          if (html) htmlParts.push(`<li class="notion-bullet">${html}</li>`)
          break
        }
        case 'numbered_list_item': {
          const html = richTextToHtml(block.numbered_list_item?.rich_text)
          if (html) htmlParts.push(`<li class="notion-number">${html}</li>`)
          break
        }
        case 'divider': {
          htmlParts.push('<hr class="notion-divider" />')
          break
        }
        case 'image': {
          const imageUrl = block.image?.file?.url || block.image?.external?.url
          const caption = extractPlainText(block.image?.caption || [])
          if (imageUrl) {
            htmlParts.push(`<figure class="notion-image"><img src="${imageUrl}" alt="${caption || 'Image'}" loading="lazy" />${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`)
          }
          break
        }
        // Skip unsupported blocks silently
      }
    }

    // Wrap consecutive list items in ul/ol tags
    let html = htmlParts.join('\n')
    html = html.replace(/(<li class="notion-bullet">.*?<\/li>\n?)+/g, '<ul class="notion-list">$&</ul>')
    html = html.replace(/(<li class="notion-number">.*?<\/li>\n?)+/g, '<ol class="notion-list">$&</ol>')

    return html
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
        caption = extractPlainText((captionProperty as any).title)
      } else if ((captionProperty as any)?.rich_text) {
        caption = extractPlainText((captionProperty as any).rich_text)
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
    // Get language from query parameter (default: Spanish)
    const lang = req.query.lang === 'en' ? 'en' : 'es'

    const [message, photosResult] = await Promise.all([
      getCoupleMessage(lang),
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
