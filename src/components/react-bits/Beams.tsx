import React from 'react'

interface BeamsProps {
  className?: string
  color?: string // Hex color
  opacity?: number
  beamCount?: number
}

export const Beams: React.FC<BeamsProps> = ({
  className = '',
  color = '#D4AF37',
  opacity = 0.15,
  beamCount = 6,
}) => {
  const beams = Array.from({ length: beamCount }, (_, i) => ({
    id: i,
    delay: i * 0.8,
    duration: 8 + Math.random() * 4,
    width: 2 + Math.random() * 3,
    left: (100 / beamCount) * i + Math.random() * 10,
  }))

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ opacity }}
    >
      {beams.map((beam) => (
        <div
          key={beam.id}
          className="absolute h-full animate-beam"
          style={{
            left: `${beam.left}%`,
            width: `${beam.width}px`,
            background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
            animationDelay: `${beam.delay}s`,
            animationDuration: `${beam.duration}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes beam {
          0%, 100% {
            transform: translateY(-100%) rotate(15deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100%) rotate(15deg);
            opacity: 0;
          }
        }
        .animate-beam {
          animation: beam linear infinite;
        }
      `}</style>
    </div>
  )
}

export default Beams
