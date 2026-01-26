// Types for Notion gallery content

export interface NotionPhoto {
  id: string
  url: string
  caption?: string
  width?: number
  height?: number
}

export interface NotionGalleryContent {
  message: string
  photos: NotionPhoto[]
  lastUpdated?: string
}

export interface NotionAPIResponse {
  success: boolean
  data?: NotionGalleryContent
  error?: string
}
