import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Beams } from './react-bits/Beams'

interface FAQItem {
  key: string
  icon: React.ReactNode
  question: string
  answer?: string
  answerLines?: string[]
}

interface FAQCarouselProps {
  title: string
  rsvpLink: string
  rsvpLinkText: string
  items: FAQItem[]
  dressCodeColors?: string[]
  lang?: 'es' | 'en'
}

export const FAQCarousel: React.FC<FAQCarouselProps> = ({
  title,
  rsvpLink,
  rsvpLinkText,
  items,
  dressCodeColors = [],
  lang = 'es',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prev) => {
      let next = prev + newDirection
      if (next < 0) next = items.length - 1
      if (next >= items.length) next = 0
      return next
    })
  }, [items.length])

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }, [currentIndex])

  const currentItem = items[currentIndex]
  const isDressCode = currentItem?.key === 'dresscode'

  return (
    <section id="faq" className="faq-carousel-section">
      {/* Subtle beams background */}
      <Beams color="#D4AF37" opacity={0.08} beamCount={4} />
      
      {/* Decorative flowers */}
      <img src="/images/hibiscus.png" alt="" className="faq-flower faq-flower-left" />
      <img src="/images/bird_of_paradise.png" alt="" className="faq-flower faq-flower-right" />

      <div className="section-inner">
        <div className="section-heading">
          <h2 className="section-title">{title}</h2>
        </div>

        <div className="faq-carousel-container">
          {/* Previous Button */}
          <button
            className="faq-carousel-nav faq-carousel-prev"
            onClick={() => paginate(-1)}
            aria-label={lang === 'es' ? 'Anterior' : 'Previous'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </button>

          {/* Carousel Cards */}
          <div className="faq-carousel-cards">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(_, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x)
                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1)
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1)
                  }
                }}
                className="faq-carousel-card"
              >
                <div className="faq-carousel-icon">{currentItem.icon}</div>
                <h3 className="faq-carousel-question">{currentItem.question}</h3>
                <div className="faq-carousel-answer">
                  {currentItem.answer ? (
                    <p>{currentItem.answer}</p>
                  ) : (
                    <div className="space-y-3">
                      {currentItem.answerLines?.map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                      {isDressCode && dressCodeColors.length > 0 && (
                        <motion.div 
                          className="faq-dress-colors"
                          initial="hidden"
                          animate="visible"
                          variants={{
                            hidden: { opacity: 0 },
                            visible: {
                              opacity: 1,
                              transition: { staggerChildren: 0.1, delayChildren: 0.3 }
                            }
                          }}
                        >
                          {dressCodeColors.map((color, i) => (
                            <motion.span
                              key={i}
                              className={`faq-dress-color ${color}`}
                              variants={{
                                hidden: { scale: 0, opacity: 0 },
                                visible: { scale: 1, opacity: 1 }
                              }}
                            />
                          ))}
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Button */}
          <button
            className="faq-carousel-nav faq-carousel-next"
            onClick={() => paginate(1)}
            aria-label={lang === 'es' ? 'Siguiente' : 'Next'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="faq-carousel-dots">
          {items.map((_, index) => (
            <button
              key={index}
              className={`faq-carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to FAQ ${index + 1}`}
            />
          ))}
        </div>

        {/* RSVP Link */}
        <div className="faq-rsvp-row">
          <a href={rsvpLink} className="faq-rsvp-link">
            {rsvpLinkText}
          </a>
        </div>
      </div>
    </section>
  )
}

export default FAQCarousel
