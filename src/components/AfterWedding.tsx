import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useNotionGallery } from '../hooks/useNotionGallery'
import type { NotionPhoto } from '../types/notion'

interface AfterWeddingProps {
  content: {
    title: string
    messageMain: string
    messageSecondary: string
    signoff: string
    comingSoonTitle: string
    comingSoonMessage: string
    comingSoonNote: string
    galleryTitle?: string
    galleryLoading?: string
  }
}

const heartIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    className="mx-auto text-boda-burgundy"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const cameraIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mx-auto text-boda-burgundy"
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
)

const cameraIconSmall = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-boda-burgundy/40"
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
)

const closeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const chevronLeft = (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
)

const chevronRight = (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
)

// Lightbox component for viewing photos
const Lightbox = ({ 
  photos, 
  currentIndex, 
  onClose, 
  onPrev, 
  onNext 
}: { 
  photos: NotionPhoto[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) => {
  const photo = photos[currentIndex]
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="lightbox-overlay"
      onClick={onClose}
    >
      <button 
        className="lightbox-close" 
        onClick={onClose}
        aria-label="Cerrar"
      >
        {closeIcon}
      </button>
      
      {photos.length > 1 && (
        <>
          <button 
            className="lightbox-nav lightbox-prev" 
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="Anterior"
          >
            {chevronLeft}
          </button>
          <button 
            className="lightbox-nav lightbox-next" 
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="Siguiente"
          >
            {chevronRight}
          </button>
        </>
      )}
      
      <motion.div
        key={photo.id}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="lightbox-content"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={photo.url} 
          alt={photo.caption || 'Foto de la boda'} 
          className="lightbox-image"
        />
        {photo.caption && (
          <p className="lightbox-caption">{photo.caption}</p>
        )}
        <p className="lightbox-counter">
          {currentIndex + 1} / {photos.length}
        </p>
      </motion.div>
    </motion.div>
  )
}

export const AfterWedding = ({ content }: AfterWeddingProps) => {
  const { content: notionContent, isLoading } = useNotionGallery()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const hasPhotos = notionContent?.photos && notionContent.photos.length > 0
  const hasCustomMessage = notionContent?.message && notionContent.message.trim().length > 0

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const prevPhoto = () => {
    if (lightboxIndex !== null && notionContent?.photos) {
      setLightboxIndex((lightboxIndex - 1 + notionContent.photos.length) % notionContent.photos.length)
    }
  }
  const nextPhoto = () => {
    if (lightboxIndex !== null && notionContent?.photos) {
      setLightboxIndex((lightboxIndex + 1) % notionContent.photos.length)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="after-wedding-section"
    >
      <div className="after-wedding-inner">
        {/* Header with heart */}
        <div className="after-wedding-header">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 1 }}
            className="mb-6"
          >
            {heartIcon}
          </motion.div>

          <h1 className="after-wedding-title">{content.title}</h1>

          <p className="after-wedding-names">Deyaneira & Aaron</p>

          <div className="after-wedding-divider" />
        </div>

        {/* Main thank you message - Use custom message from Notion if available */}
        <div className="after-wedding-card">
          {hasCustomMessage ? (
            // Custom message from Notion
            <div className="after-wedding-custom-message">
              {notionContent!.message.split('\n\n').map((paragraph, i) => (
                <p key={i} className="after-wedding-message-main">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            // Default messages
            <>
              <p className="after-wedding-message-main">{content.messageMain}</p>
              <p className="after-wedding-message-secondary">
                {content.messageSecondary}
              </p>
            </>
          )}

          {/* Couple signature */}
          <div className="after-wedding-signature">
            <p className="after-wedding-signoff">{content.signoff}</p>
            <p className="after-wedding-couple">Deyaneira & Aaron</p>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="after-wedding-gallery">
          <div className="after-wedding-gallery-header">
            {cameraIcon}
            <h2 className="after-wedding-gallery-title">
              {hasPhotos 
                ? (content.galleryTitle || 'Recuerdos de Nuestra Boda')
                : content.comingSoonTitle
              }
            </h2>
            {!hasPhotos && (
              <p className="after-wedding-gallery-message">
                {content.comingSoonMessage}
              </p>
            )}
          </div>

          {/* Photo grid - Real photos or placeholders */}
          {isLoading ? (
            <div className="after-wedding-loading">
              <div className="loading-spinner" />
              <p>{content.galleryLoading || 'Cargando fotos...'}</p>
            </div>
          ) : hasPhotos ? (
            <div className="after-wedding-photo-grid after-wedding-photo-grid-real">
              {notionContent!.photos.map((photo, index) => (
                <motion.button
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="after-wedding-photo-item"
                  onClick={() => openLightbox(index)}
                  aria-label={photo.caption || `Ver foto ${index + 1}`}
                >
                  <img 
                    src={photo.url} 
                    alt={photo.caption || `Foto ${index + 1}`}
                    loading="lazy"
                  />
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="after-wedding-photo-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="after-wedding-photo-placeholder"
                >
                  {cameraIconSmall}
                </motion.div>
              ))}
            </div>
          )}

          {!hasPhotos && (
            <p className="after-wedding-gallery-note">{content.comingSoonNote}</p>
          )}
        </div>

        {/* Floral decoration */}
        <div className="after-wedding-decor">🌺 🌴 🌺</div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && notionContent?.photos && (
          <Lightbox
            photos={notionContent.photos}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevPhoto}
            onNext={nextPhoto}
          />
        )}
      </AnimatePresence>
    </motion.section>
  )
}
