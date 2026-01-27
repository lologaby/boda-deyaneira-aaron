import React from 'react'
import { motion } from 'framer-motion'
import { SpotlightCard } from './react-bits/SpotlightCard'
import { TiltedCard } from './react-bits/TiltedCard'

// Icons for meal types
const SunIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
)

const UtensilsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
  </svg>
)

const MoonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const CakeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M4 16h16M12 3v3M8 6h8" />
    <circle cx="12" cy="8" r="2" />
  </svg>
)

const CoffeeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8zM6 2v4M10 2v4M14 2v4" />
  </svg>
)

const WavesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
  </svg>
)

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'desserts' | 'cafe'

interface Restaurant {
  name: string
  url: string
  meal: MealType
  description?: string
  image?: string
}

interface Beach {
  name: string
  url: string
  image?: string
}

interface RestaurantsSectionProps {
  title: string
  restaurantsLabel: string
  beachesLabel: string
  mealLabels: Record<MealType, string>
  restaurants: Restaurant[]
  beaches: Beach[]
  plateaText: string
  plateaUrl: string
}

const mealConfig: Record<MealType, { icon: React.ReactNode; color: string; spotlightColor: string; description: string }> = {
  breakfast: {
    icon: <SunIcon />,
    color: '#FFB347',
    spotlightColor: '255, 179, 71',
    description: 'Comienza el día con vistas al mar',
  },
  lunch: {
    icon: <UtensilsIcon />,
    color: '#87CEEB',
    spotlightColor: '135, 206, 235',
    description: 'Sabores frescos del Caribe',
  },
  dinner: {
    icon: <MoonIcon />,
    color: '#9B7EDE',
    spotlightColor: '155, 126, 222',
    description: 'Cenas bajo las estrellas',
  },
  desserts: {
    icon: <CakeIcon />,
    color: '#FFB6C1',
    spotlightColor: '255, 182, 193',
    description: 'Dulces tentaciones artesanales',
  },
  cafe: {
    icon: <CoffeeIcon />,
    color: '#C19A6B',
    spotlightColor: '193, 154, 107',
    description: 'El mejor café de la isla',
  },
}

// Default restaurant descriptions
const restaurantDescriptions: Record<string, Record<'es' | 'en', string>> = {
  'Alba': { es: 'Comienza el día con vistas al mar', en: 'Start your day with ocean views' },
  'Sal De Mar': { es: 'Mariscos frescos y ambiente único', en: 'Fresh seafood and unique atmosphere' },
  'Monson': { es: 'Cenas elegantes bajo las estrellas', en: 'Elegant dinners under the stars' },
  'La Chocolateria': { es: 'Dulces tentaciones artesanales', en: 'Artisan sweet temptations' },
  'Levian': { es: 'El mejor café de la isla', en: 'The best coffee on the island' },
}

export const RestaurantsSection: React.FC<RestaurantsSectionProps> = ({
  title,
  restaurantsLabel,
  beachesLabel,
  mealLabels,
  restaurants,
  beaches,
  plateaText,
  plateaUrl,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] },
    },
  }

  return (
    <div className="restaurants-section">
      {/* Restaurants Grid */}
      <div className="restaurants-subsection">
        <h3 className="restaurants-label">{restaurantsLabel}</h3>
        <motion.div
          className="restaurants-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-30px' }}
        >
          {restaurants.map((restaurant) => {
            const config = mealConfig[restaurant.meal]
            const description = restaurantDescriptions[restaurant.name]?.es || config.description
            
            return (
              <motion.div key={restaurant.name} variants={itemVariants}>
                <a
                  href={restaurant.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="restaurant-card-link"
                >
                  <SpotlightCard
                    className="restaurant-card"
                    spotlightColor={config.spotlightColor}
                  >
                    <div 
                      className="restaurant-icon-wrapper"
                      style={{ backgroundColor: `${config.color}20`, color: config.color }}
                    >
                      {config.icon}
                    </div>
                    <div className="restaurant-info">
                      <span 
                        className="restaurant-meal-tag"
                        style={{ backgroundColor: `${config.color}30`, color: config.color }}
                      >
                        {mealLabels[restaurant.meal]}
                      </span>
                      <h4 className="restaurant-name">{restaurant.name}</h4>
                      <p className="restaurant-description">{description}</p>
                    </div>
                    <div className="restaurant-arrow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </div>
                  </SpotlightCard>
                </a>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Beaches Grid with TiltedCards */}
      <div className="beaches-subsection">
        <h3 className="beaches-label">{beachesLabel}</h3>
        <motion.div
          className="beaches-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-30px' }}
        >
          {beaches.map((beach) => (
            <motion.div key={beach.name} variants={itemVariants}>
              <a
                href={beach.url}
                target="_blank"
                rel="noopener noreferrer"
                className="beach-card-link"
              >
                <TiltedCard className="beach-card" maxTilt={8} scale={1.02}>
                  <div className="beach-card-content">
                    <div className="beach-icon">
                      <WavesIcon />
                    </div>
                    <span className="beach-name">{beach.name}</span>
                    <div className="beach-arrow">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </div>
                  </div>
                </TiltedCard>
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Platea Link */}
      <div className="platea-wrapper">
        <a
          href={plateaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="platea-link"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="7" />
          </svg>
          <span>{plateaText}</span>
        </a>
      </div>
    </div>
  )
}

export default RestaurantsSection
