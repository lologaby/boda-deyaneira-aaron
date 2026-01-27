import React from 'react'
import { motion } from 'framer-motion'

interface BlurTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
}

export const BlurText: React.FC<BlurTextProps> = ({
  text,
  className = '',
  delay = 0,
  duration = 0.8,
}) => {
  const words = text.split(' ')

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: 0.1,
      },
    },
  }

  const child = {
    hidden: {
      opacity: 0,
      filter: 'blur(10px)',
      y: 10,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 100,
        duration,
      },
    },
  }

  return (
    <motion.span
      className={`inline-flex flex-wrap gap-x-2 ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}

export default BlurText
