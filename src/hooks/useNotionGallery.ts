import { useState, useEffect, useRef } from 'react'
import type { NotionGalleryContent, NotionAPIResponse } from '../types/notion'

interface UseNotionGalleryResult {
  content: NotionGalleryContent | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Default/fallback content when Notion is not configured or unavailable
const DEFAULT_CONTENT: NotionGalleryContent = {
  message: '',
  photos: [],
}

// Translate text using our API
async function translateText(text: string, to: string): Promise<string> {
  if (!text || to === 'es') return text // Original is in Spanish

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        from: 'es',
        to,
        isHtml: true, // The message is HTML now
      }),
    })

    const data = await response.json()
    return data.translated || text
  } catch (error) {
    console.warn('Translation failed, using original:', error)
    return text
  }
}

export const useNotionGallery = (lang: 'es' | 'en' = 'es'): UseNotionGalleryResult => {
  const [content, setContent] = useState<NotionGalleryContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Cache for original content and translations
  const originalContentRef = useRef<NotionGalleryContent | null>(null)
  const translationCacheRef = useRef<{ [key: string]: string }>({})

  const fetchContent = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // In development without API, use default content
      const apiUrl = import.meta.env.PROD 
        ? '/api/notion'
        : import.meta.env.VITE_NOTION_API_URL || '/api/notion'

      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        // If API is not available, use default content silently
        if (response.status === 404) {
          setContent(DEFAULT_CONTENT)
          originalContentRef.current = DEFAULT_CONTENT
          return
        }
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data: NotionAPIResponse = await response.json()

      if (data.success && data.data) {
        originalContentRef.current = data.data
        
        // If language is not Spanish, translate the message
        if (lang !== 'es' && data.data.message) {
          const cacheKey = `${lang}:${data.data.message.substring(0, 50)}`
          
          if (translationCacheRef.current[cacheKey]) {
            setContent({
              ...data.data,
              message: translationCacheRef.current[cacheKey],
            })
          } else {
            const translated = await translateText(data.data.message, lang)
            translationCacheRef.current[cacheKey] = translated
            setContent({
              ...data.data,
              message: translated,
            })
          }
        } else {
          setContent(data.data)
        }
      } else {
        // Use default content if no data
        setContent(DEFAULT_CONTENT)
        originalContentRef.current = DEFAULT_CONTENT
      }
    } catch (err) {
      console.warn('Notion gallery not available:', err)
      // Fail silently and use default content
      setContent(DEFAULT_CONTENT)
      originalContentRef.current = DEFAULT_CONTENT
      // Only set error in development
      if (import.meta.env.DEV) {
        setError('Notion API not available. Using placeholder content.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch on mount
  useEffect(() => {
    fetchContent()
  }, [])

  // Handle language changes without refetching from Notion
  useEffect(() => {
    const updateTranslation = async () => {
      if (!originalContentRef.current?.message) return

      if (lang === 'es') {
        // Use original Spanish content
        setContent(originalContentRef.current)
      } else {
        // Translate to target language
        const cacheKey = `${lang}:${originalContentRef.current.message.substring(0, 50)}`
        
        if (translationCacheRef.current[cacheKey]) {
          setContent({
            ...originalContentRef.current,
            message: translationCacheRef.current[cacheKey],
          })
        } else {
          setIsLoading(true)
          const translated = await translateText(originalContentRef.current.message, lang)
          translationCacheRef.current[cacheKey] = translated
          setContent({
            ...originalContentRef.current,
            message: translated,
          })
          setIsLoading(false)
        }
      }
    }

    // Only run if we have original content loaded
    if (originalContentRef.current) {
      updateTranslation()
    }
  }, [lang])

  return {
    content,
    isLoading,
    error,
    refetch: fetchContent,
  }
}
