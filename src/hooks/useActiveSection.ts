import { useState, useEffect } from 'react'

export const useActiveSection = () => {
  const [activeSection, setActiveSection] = useState<string>('faq')

  useEffect(() => {
    const sections = ['faq', 'location', 'travel', 'gifts', 'rsvp']
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150 // Offset for better detection
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i])
        if (section) {
          const sectionTop = section.offsetTop
          if (scrollPosition >= sectionTop) {
            setActiveSection(sections[i])
            return
          }
        }
      }
      
      // Default to first section if at top
      setActiveSection('faq')
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check on mount
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return activeSection
}
