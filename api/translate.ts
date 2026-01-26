import type { VercelRequest, VercelResponse } from '@vercel/node'

// Simple in-memory cache for translations (resets on cold start)
const translationCache = new Map<string, string>()

// Generate a cache key from text and language pair
function getCacheKey(text: string, from: string, to: string): string {
  return `${from}:${to}:${text.substring(0, 100)}`
}

// Translate using MyMemory API (free, no API key needed for basic use)
async function translateWithMyMemory(text: string, from: string, to: string): Promise<string> {
  const url = new URL('https://api.mymemory.translated.net/get')
  url.searchParams.set('q', text)
  url.searchParams.set('langpair', `${from}|${to}`)
  
  // Add email for higher rate limits (10,000 words/day instead of 1,000)
  const email = process.env.MYMEMORY_EMAIL
  if (email) {
    url.searchParams.set('de', email)
  }

  const response = await fetch(url.toString())
  
  if (!response.ok) {
    throw new Error(`MyMemory API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails || 'Translation failed')
  }

  return data.responseData.translatedText
}

// Translate HTML content while preserving tags
async function translateHtml(html: string, from: string, to: string): Promise<string> {
  // Split HTML into text and tags
  const parts = html.split(/(<[^>]+>)/g)
  
  // Collect text parts that need translation
  const textParts: { index: number; text: string }[] = []
  
  parts.forEach((part, index) => {
    // Skip empty strings and HTML tags
    if (!part.trim() || part.startsWith('<')) return
    textParts.push({ index, text: part })
  })

  // If no text to translate, return original
  if (textParts.length === 0) return html

  // Translate all text parts (batch them to reduce API calls)
  // Join with a unique separator that won't appear in the text
  const separator = ' ||| '
  const combinedText = textParts.map(p => p.text).join(separator)
  
  // Check cache first
  const cacheKey = getCacheKey(combinedText, from, to)
  let translatedCombined = translationCache.get(cacheKey)
  
  if (!translatedCombined) {
    translatedCombined = await translateWithMyMemory(combinedText, from, to)
    translationCache.set(cacheKey, translatedCombined)
  }

  // Split back and replace in parts array
  const translatedParts = translatedCombined.split(/\s*\|\|\|\s*/)
  
  textParts.forEach((textPart, i) => {
    if (translatedParts[i]) {
      parts[textPart.index] = translatedParts[i]
    }
  })

  return parts.join('')
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { text, from = 'es', to = 'en', isHtml = false } = req.body

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ success: false, error: 'Text is required' })
  }

  // Don't translate if same language
  if (from === to) {
    return res.status(200).json({ success: true, translated: text })
  }

  try {
    let translated: string

    if (isHtml) {
      translated = await translateHtml(text, from, to)
    } else {
      // Check cache
      const cacheKey = getCacheKey(text, from, to)
      const cached = translationCache.get(cacheKey)
      
      if (cached) {
        translated = cached
      } else {
        translated = await translateWithMyMemory(text, from, to)
        translationCache.set(cacheKey, translated)
      }
    }

    // Cache response for 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')

    return res.status(200).json({
      success: true,
      translated,
      from,
      to,
    })
  } catch (error: any) {
    console.error('Translation error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Translation failed',
      // Return original text as fallback
      translated: text,
    })
  }
}
