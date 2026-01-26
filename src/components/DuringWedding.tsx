import { motion } from 'framer-motion'

interface DuringWeddingProps {
  content: {
    title: string
    subtitle: string
    message: string
    location: string
    time: string
    note: string
  }
}

const heartIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="96"
    height="96"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    className="mx-auto"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const sparklesIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M3 5h4" />
    <path d="M19 17v4" />
    <path d="M17 19h4" />
  </svg>
)

const musicIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
)

export const DuringWedding = ({ content }: DuringWeddingProps) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="during-wedding-section"
    >
      <div className="during-wedding-inner">
        {/* Animated heart */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="during-wedding-heart"
        >
          {heartIcon}
        </motion.div>

        {/* Title */}
        <h1 className="during-wedding-title">{content.title}</h1>

        {/* Subtitle */}
        <p className="during-wedding-subtitle">{content.subtitle}</p>

        {/* Main message card */}
        <div className="during-wedding-card">
          <p className="during-wedding-message">{content.message}</p>

          {/* Event details */}
          <div className="during-wedding-details">
            <div className="during-wedding-detail">
              {sparklesIcon}
              <span>{content.location}</span>
            </div>
            <div className="during-wedding-detail">
              {musicIcon}
              <span>{content.time}</span>
            </div>
          </div>
        </div>

        {/* Additional note */}
        <p className="during-wedding-note">{content.note}</p>

        {/* Animated decorative elements */}
        <div className="during-wedding-decor">
          <motion.span
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌺
          </motion.span>
          <motion.span
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          >
            🌴
          </motion.span>
          <motion.span
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          >
            🌺
          </motion.span>
        </div>
      </div>
    </motion.section>
  )
}
