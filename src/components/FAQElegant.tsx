import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TbShirt } from 'react-icons/tb'
import { TbShoe } from 'react-icons/tb'

interface FAQItem {
  key: string
  icon: React.ReactNode
  question: string
  answer?: string
  answerLines?: string[]
}

interface FAQElegantProps {
  title: string
  items: FAQItem[]
  dressCodeColors?: string[]
}

export const FAQElegant: React.FC<FAQElegantProps> = ({
  title,
  items,
  dressCodeColors = [],
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="faq-elegant-section">
      {/* Decorative flowers */}
      <img src="/images/hibiscus.png" alt="" className="faq-flower faq-flower-left" />
      <img src="/images/bird_of_paradise.png" alt="" className="faq-flower faq-flower-right" />

      <div className="section-inner">
        <div className="section-heading">
          <h2 className="section-title">{title}</h2>
        </div>

        {/* FAQ Items - Elegant accordion */}
        <div className="faq-elegant-list">
          {items.map((item, index) => {
            const isOpen = openIndex === index
            const isDressCode = item.key === 'dresscode'

            return (
              <motion.div
                key={item.key}
                className={`faq-elegant-item ${isOpen ? 'is-open' : ''}`}
                initial={false}
                layout
              >
                <button
                  className="faq-elegant-trigger"
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-elegant-icon">{item.icon}</span>
                  <span className="faq-elegant-question">{item.question}</span>
                  <motion.span 
                    className="faq-elegant-chevron"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6,9 12,15 18,9" />
                    </svg>
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="faq-elegant-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <div className="faq-elegant-answer">
                        {item.answer ? (
                          <p>{item.answer}</p>
                        ) : (
                          <>
                            {item.answerLines?.map((line, i) => {
                              // Check if line contains "No shorts" or "No sandals"
                              const isNoShorts = line.toLowerCase().includes('no shorts') || line.toLowerCase().includes('no pantalones cortos')
                              const isNoSandals = line.toLowerCase().includes('no sandals') || line.toLowerCase().includes('no sandalias')
                              
                              if (isNoShorts || isNoSandals) {
                                const Icon = isNoShorts ? TbShirt : TbShoe
                                return (
                                  <div key={i} className="faq-dresscode-prohibited">
                                    <div className="faq-prohibited-icon-wrapper">
                                      <Icon className="faq-prohibited-icon" />
                                      <div className="faq-prohibited-x"></div>
                                    </div>
                                    <p className="faq-prohibited-text">{line.replace(/^•\s*/, '')}</p>
                                  </div>
                                )
                              }
                              return <p key={i}>{line}</p>
                            })}
                            {isDressCode && dressCodeColors.length > 0 && (
                              <motion.div 
                                className="faq-elegant-colors"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                  hidden: { opacity: 0 },
                                  visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
                                  }
                                }}
                              >
                                {dressCodeColors.map((color, i) => (
                                  <motion.span
                                    key={i}
                                    className={`faq-elegant-color ${color}`}
                                    variants={{
                                      hidden: { scale: 0, opacity: 0 },
                                      visible: { scale: 1, opacity: 1 }
                                    }}
                                  />
                                ))}
                              </motion.div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FAQElegant
