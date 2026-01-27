import React from 'react'
import { motion } from 'framer-motion'
import { SpotlightCard } from './react-bits/SpotlightCard'

interface Photo {
  url: string
  caption: string
  location?: string
}

interface PhotoGalleryProps {
  title: string
  subtitle?: string
  photos: Photo[]
  spotlightColor?: string
}

// Placeholder photos - will be replaced with actual couple photos
const defaultPhotos: Photo[] = [
  { url: '/photos/couple1.jpg', caption: 'Nuestra primera cita', location: 'Nueva York' },
  { url: '/photos/couple2.jpg', caption: 'La pedida de mano', location: 'Central Park' },
  { url: '/photos/couple3.jpg', caption: 'Juntos en Puerto Rico', location: 'Aguadilla' },
  { url: '/photos/couple4.jpg', caption: 'Una noche especial', location: 'Brooklyn' },
  { url: '/photos/couple5.jpg', caption: 'Vacaciones juntos', location: 'Miami' },
  { url: '/photos/couple6.jpg', caption: 'El comienzo de todo', location: 'NYC' },
]

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  title,
  subtitle,
  photos = defaultPhotos,
  spotlightColor = '232, 156, 124', // Terracotta RGB
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96],
      },
    },
  }

  return (
    <section className="photo-gallery-section">
      <div className="section-inner">
        <div className="section-heading">
          <h2 className="photo-gallery-title">{title}</h2>
          {subtitle && <p className="photo-gallery-subtitle">{subtitle}</p>}
        </div>

        <motion.div
          className="photo-gallery-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {photos.map((photo, index) => (
            <motion.div key={index} variants={itemVariants}>
              <SpotlightCard
                className="photo-gallery-card"
                spotlightColor={spotlightColor}
              >
                <div className="photo-gallery-image-wrapper">
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="photo-gallery-image"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to placeholder on error
                      const target = e.target as HTMLImageElement
                      target.src = `https://placehold.co/400x500/F5EFE7/8B4B5C?text=${encodeURIComponent(photo.caption || 'Foto')}`
                    }}
                  />
                  <div className="photo-gallery-overlay" />
                </div>
                <div className="photo-gallery-caption">
                  <p className="photo-gallery-caption-text">{photo.caption}</p>
                  {photo.location && (
                    <span className="photo-gallery-location">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {photo.location}
                    </span>
                  )}
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default PhotoGallery
