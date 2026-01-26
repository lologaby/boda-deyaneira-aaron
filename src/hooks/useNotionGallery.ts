import { useState, useEffect } from 'react'
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

export const useNotionGallery = (): UseNotionGalleryResult => {
  const [content, setContent] = useState<NotionGalleryContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          return
        }
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data: NotionAPIResponse = await response.json()

      if (data.success && data.data) {
        setContent(data.data)
      } else {
        // Use default content if no data
        setContent(DEFAULT_CONTENT)
      }
    } catch (err) {
      console.warn('Notion gallery not available:', err)
      // Fail silently and use default content
      setContent(DEFAULT_CONTENT)
      // Only set error in development
      if (import.meta.env.DEV) {
        setError('Notion API not available. Using placeholder content.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContent()
  }, [])

  return {
    content,
    isLoading,
    error,
    refetch: fetchContent,
  }
}
