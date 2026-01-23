import React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

type Language = 'es' | 'en'

const planeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#d6b161"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-plane-icon"
  >
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
)

const copy = {
  es: {
    nav: {
      faq: 'Preguntas',
      location: 'Ubicación',
      rsvp: 'RSVP',
      toggle: 'EN / ES',
    },
    details: 'Detalles',
    hero: {
      names: 'DEYANEIRA & AARON',
      tagline: 'Te invitamos a celebrar nuestro amor bajo el atardecer',
      date: '07.18.26 | 5:00 PM',
      venueLine1: 'Officers Club, Punta Borinquen Resort',
      venueLine2: 'Aguadilla, PR 00603',
    },
    countdown: {
      title: 'Faltan',
      days: 'Días',
      hours: 'Horas',
      minutes: 'Minutos',
      seconds: 'Segundos',
    },
    faq: {
      title: 'Preguntas Frecuentes',
      items: [
        {
          key: 'plusone',
          icon: '✶',
          question: '¿Puedo traer un invitado (+1)?',
          answer:
            'Nos encantaría celebrar con todos, sin embargo, solo los invitados con un +1 incluido podrán traer acompañante. Si su invitación lo incluye, lo verá claramente indicado.',
        },
        {
          key: 'hotel',
          icon: '⌂',
          question: '¿Hay un bloque de hotel reservado?',
          answer:
            'Sí. Hemos reservado un bloque de habitaciones en Parador Punta Borinquen, Aguadilla, PR 00603. Para recibir la tarifa con descuento, puede utilizar la boda como referencia al momento de hacer su reservación.',
        },
        {
          key: 'airport',
          icon: planeIcon,
          question: '¿Qué aeropuerto debo utilizar para llegar?',
          answer:
            'Puerto Rico es una isla accesible y fácil de recorrer. Si planea hospedarse en el área oeste, le recomendamos llegar al Aeropuerto Rafael Hernández (BQN) en Aguadilla.',
        },
        {
          key: 'children',
          icon: '♡',
          question: '¿Pueden asistir niños?',
          answer:
            'Amamos a todos los peques, pero hemos decidido que nuestra ceremonia y recepción serán solo para adultos. Los invitamos a aprovechar esta ocasión como un date night.',
        },
        {
          key: 'dresscode',
          icon: '✦',
          question: '¿Cuál es el código de vestimenta?',
          answerLines: [
            'El código de vestimenta es formal playero.',
            '– No pantalones cortos, – No sandalias para hombres',
            'Adjuntamos una paleta de colores como referencia para su atuendo.',
          ],
        },
      ],
    },
    location: {
      title: 'Ubicación',
      address: 'Officers Club, Punta Borinquen Resort, Aguadilla, PR 00603',
      button: 'CÓMO LLEGAR',
    },
    rsvp: {
      title: 'RSVP',
      subtitle: 'Confirmar asistencia',
      nameLabel: 'Nombre completo',
      namePlaceholder: 'Tu nombre y apellido',
      attendanceLabel: '¿Asistirás?',
      attendanceYes: 'Sí, celebraré con ustedes',
      attendanceNo: 'Lo siento, no podré ir',
      guestsLabel: 'Invitados totales',
      songLabel: 'Canción para bailar',
      songPlaceholder: 'Ej. Callaita',
      submit: 'ENVIAR',
      submitting: 'ENVIANDO...',
      success: '¡Gracias! Recibimos tu RSVP.',
      error: 'Hubo un problema. Inténtalo de nuevo.',
      missingEndpoint: 'Configura el enlace del Google Form para enviar.',
    },
    calendar: {
      add: 'Agregar al calendario',
    },
    intro: {
      hint: 'Descubre',
    },
  },
  en: {
    nav: {
      faq: 'FAQ',
      location: 'Location',
      rsvp: 'RSVP',
      toggle: 'ES / EN',
    },
    details: 'Details',
    hero: {
      names: 'DEYANEIRA & AARON',
      tagline: 'We invite you to celebrate our love under the sunset',
      date: '07.18.26 | 5:00 PM',
      venueLine1: 'Officers Club, Punta Borinquen Resort',
      venueLine2: 'Aguadilla, PR 00603',
    },
    countdown: {
      title: 'Countdown',
      days: 'Days',
      hours: 'Hours',
      minutes: 'Minutes',
      seconds: 'Seconds',
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          key: 'plusone',
          icon: '✶',
          question: 'Can I bring a guest (+1)?',
          answer:
            'We would love to celebrate with everyone; however, only guests with a +1 indicated on their invitation may bring an additional guest.',
        },
        {
          key: 'hotel',
          icon: '⌂',
          question: 'Is there a hotel room block available?',
          answer:
            'Yes! A room block has been reserved at Parador Punta Borinquen, Aguadilla, PR 00603. Please mention the wedding when booking to receive the discounted rate.',
        },
        {
          key: 'airport',
          icon: planeIcon,
          question: 'Which airport should I use when traveling?',
          answer:
            'Puerto Rico is easy to navigate. If you plan to stay in the western area, we recommend flying into Rafael Hernández Airport (BQN) in Aguadilla.',
        },
        {
          key: 'children',
          icon: '♡',
          question: 'Are children allowed to attend?',
          answer:
            'While we love all little ones, we have decided to make our ceremony and reception adults-only. Enjoy a special date night.',
        },
        {
          key: 'dresscode',
          icon: '✦',
          question: 'What is the dress code?',
          answerLines: [
            'The dress code is beach formal.',
            '– No shorts, – No sandals for men',
            'We have included a color palette for outfit inspiration.',
          ],
        },
      ],
    },
    location: {
      title: 'Location',
      address: 'Officers Club, Punta Borinquen Resort, Aguadilla, PR 00603',
      button: 'GET DIRECTIONS',
    },
    rsvp: {
      title: 'RSVP',
      subtitle: 'Confirm attendance',
      nameLabel: 'Full name',
      namePlaceholder: 'Your full name',
      attendanceLabel: 'Will you attend?',
      attendanceYes: 'Joyfully accepts',
      attendanceNo: 'Regretfully declines',
      guestsLabel: 'Total guests',
      songLabel: 'Song request',
      songPlaceholder: 'e.g. Callaita',
      submit: 'SUBMIT',
      submitting: 'SENDING...',
      success: 'Thank you! Your RSVP is received.',
      error: 'Something went wrong. Please try again.',
      missingEndpoint: 'Set the Google Form link to submit.',
    },
    calendar: {
      add: 'Add to calendar',
    },
    intro: {
      hint: 'Discover',
    },
  },
}

const weddingTimestamp = new Date('2026-07-18T17:00:00-04:00').getTime()

const getCountdown = () => {
  const now = Date.now()
  const distance = Math.max(weddingTimestamp - now, 0)
  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((distance / (1000 * 60)) % 60)
  const seconds = Math.floor((distance / 1000) % 60)
  return { days, hours, minutes, seconds }
}

const formatNumber = (value: number) => value.toString().padStart(2, '0')

const easeCurve: [number, number, number, number] = [0.16, 1, 0.3, 1]

const swatchColors = [
  'bg-boda-sky',
  'bg-boda-orange',
  'bg-boda-cream',
  'bg-boda-burgundy',
  'bg-boda-lime',
  'bg-boda-purple',
  'bg-boda-teal',
  'bg-boda-black',
  'bg-boda-beige',
]

const revealMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: easeCurve },
  viewport: { once: true, amount: 0.2 },
}

const calendarLink = '/calendar.ics'

export default function App() {
  const [lang, setLang] = useState<Language>('es')
  const [countdown, setCountdown] = useState(getCountdown)
  const [showIntro, setShowIntro] = useState(true)
  const [introState, setIntroState] = useState<'closed' | 'opening' | 'revealed'>('closed')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const introCompleted = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const content = copy[lang]

  const googleFormConfig = useMemo(() => {
    const action = import.meta.env.VITE_GOOGLE_FORM_ACTION as string | undefined
    const name = import.meta.env.VITE_GOOGLE_FORM_ENTRY_NAME as string | undefined
    const attendance = import.meta.env.VITE_GOOGLE_FORM_ENTRY_ATTENDANCE as string | undefined
    const guests = import.meta.env.VITE_GOOGLE_FORM_ENTRY_GUESTS as string | undefined
    const song = import.meta.env.VITE_GOOGLE_FORM_ENTRY_SONG as string | undefined
    if (!action || !name || !attendance || !guests || !song) {
      return null
    }
    return { action, name, attendance, guests, song }
  }, [])

  useEffect(() => {
    const seen = localStorage.getItem('bodaIntroSeen') === 'true'
    if (seen || prefersReducedMotion) {
      setShowIntro(false)
      setIntroState('revealed')
      return
    }
    setShowIntro(true)
    setIntroState('closed')
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCountdown(getCountdown())
    }, 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const handleIntroComplete = () => {
    if (introCompleted.current) return
    introCompleted.current = true
    localStorage.setItem('bodaIntroSeen', 'true')
    setShowIntro(false)
    setIntroState('revealed')
  }
  const handleIntroOpen = () => {
    if (introState !== 'closed') return
    setIntroState('opening')
    handleStartMusic()
    window.setTimeout(handleIntroComplete, prefersReducedMotion ? 0 : 3200)
  }

  const toggleLanguage = () => {
    setLang(prev => (prev === 'es' ? 'en' : 'es'))
  }

  const handleStartMusic = async () => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.5
    try {
      await audio.play()
    } catch {
      // ignore autoplay restrictions
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!googleFormConfig) {
      toast.error(content.rsvp.missingEndpoint)
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData(event.currentTarget)
      const response = await fetch(googleFormConfig.action, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      })

      if (response) {
        toast.success(content.rsvp.success)
        event.currentTarget.reset()
      }
    } catch (error) {
      toast.error(content.rsvp.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-boda-cream text-boda-text">
      <Toaster position="top-center" />
      <audio ref={audioRef} src="/audio/tqm.mp3" loop preload="none" />
      <AnimatePresence>
        {showIntro ? (
          <motion.div className="intro-overlay" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="intro-bg" />
            <div className="intro-leaf" aria-hidden="true" />
            <motion.button
              type="button"
              className="intro-envelope"
              onClick={handleIntroOpen}
              aria-label={content.intro.hint}
              initial={{ scale: 1, y: 0 }}
              animate={introState === 'opening' ? { scale: 1.02, y: -12 } : { scale: 1, y: 0 }}
              whileHover={introState === 'closed' ? { y: -8 } : {}}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: easeCurve }}
            >
              <div className="envelope-shell">
                <div className="envelope-body">
                  <span className="envelope-title">
                    D <span className="envelope-amp">&amp;</span> A
                  </span>
                </div>
                <motion.div
                  className="envelope-flap"
                  animate={introState === 'opening' ? { rotateX: 180 } : { rotateX: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 1.0, ease: [0.4, 0, 0.2, 1] }}
                />
                <motion.div
                  className="envelope-letter"
                  animate={
                    introState === 'opening'
                      ? { y: -180, scale: 1, opacity: 1 }
                      : { y: 0, scale: 0.85, opacity: 0 }
                  }
                  transition={{ duration: prefersReducedMotion ? 0 : 1.5, ease: easeCurve, delay: 0.6 }}
                >
                  <div className="letter-preview">
                    <span className="letter-char">D</span>
                    <span className="letter-amp">&amp;</span>
                    <span className="letter-char">A</span>
                  </div>
                </motion.div>
                <motion.div
                  className="envelope-shadow"
                  animate={introState === 'opening' ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
                />
              </div>
            </motion.button>
            <button
              type="button"
              className={`intro-dots ${introState === 'opening' ? 'hidden' : ''}`}
              onClick={handleIntroOpen}
              aria-label={content.intro.hint}
            >
              <span className="dot dot-1" />
              <span className="dot dot-2" />
              <span className="dot dot-3" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <nav className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-boda-cream/90 backdrop-blur px-3 py-2 shadow-sm">
          <a className="nav-link" href="#faq">
            {content.nav.faq}
          </a>
          <span className="text-boda-forest/40">•</span>
          <a className="nav-link" href="#location">
            {content.nav.location}
          </a>
          <span className="text-boda-forest/40">•</span>
          <a className="nav-link" href="#rsvp">
            {content.nav.rsvp}
          </a>
        </div>
        <button type="button" className="btn-outline" onClick={toggleLanguage} aria-label="Toggle language">
          {content.nav.toggle}
        </button>
      </nav>

      <header className="hero-section">
        <motion.div {...revealMotion} className="hero-inner">
          <img src="/images/Palm_leaves.png" alt="" className="hero-leaf hero-leaf-left" />
          <img src="/images/hibiscus.png" alt="" className="hero-flower hero-flower-left" />
          <img src="/images/bird_of_paradise.png" alt="" className="hero-flower hero-flower-right" />
          <div className="hero-content">
            <h1 className="hero-names">
              DEYANEIRA <span className="hero-amp">&amp;</span> AARON
            </h1>
            <p className="hero-tagline">{content.hero.tagline}</p>
            <div className="hero-details">
              <p>{content.hero.date}</p>
              <p>{content.hero.venueLine1}</p>
              <p>{content.hero.venueLine2}</p>
            </div>
            <p className="hero-kicker">{content.countdown.title}</p>
            <div className="hero-countdown">
              {[
                { label: content.countdown.days, value: countdown.days },
                { label: content.countdown.hours, value: countdown.hours },
                { label: content.countdown.minutes, value: countdown.minutes },
                { label: content.countdown.seconds, value: countdown.seconds },
              ].map(item => (
                <div key={item.label} className="countdown-card">
                  <span className="countdown-number">{formatNumber(item.value)}</span>
                  <span className="countdown-label">{item.label}</span>
                </div>
              ))}
            </div>
            <a className="stamp-link" href={calendarLink} download aria-label={content.calendar.add}>
              {content.calendar.add}
            </a>
          </div>
        </motion.div>
      </header>

      <main className="space-y-24 pb-24">
        <section id="faq" className="faq-section">
          <img src="/images/hibiscus.png" alt="" className="faq-flower faq-flower-left" />
          <img src="/images/bird_of_paradise.png" alt="" className="faq-flower faq-flower-right" />
          <motion.div {...revealMotion} className="section-inner">
            <div className="details-banner">
              <span className="details-text">{content.details}</span>
            </div>
            <div className="section-heading">
              <h2 className="section-title">{content.faq.title}</h2>
              <p className="section-subtitle">{content.hero.tagline}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {content.faq.items.map(item => (
                <div key={item.key} className="faq-card">
                  <div className="faq-title-row">
                    <span className="faq-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <h3 className="faq-title">{item.question}</h3>
                  </div>
                  <div className="faq-content">
                    {'answer' in item ? (
                      <p>{item.answer}</p>
                    ) : (
                      <div className="space-y-2">
                        {item.answerLines?.map(line => (
                          <p key={line}>{line}</p>
                        ))}
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                          {swatchColors.map(color => (
                            <span key={color} className={`h-8 w-8 rounded-full ${color} shadow-sm`} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="location" className="section">
          <motion.div {...revealMotion} className="section-inner">
            <div className="section-heading">
              <h2 className="location-title">{content.location.title}</h2>
              <p className="location-subtitle">{content.location.address}</p>
            </div>
          </motion.div>
          <motion.div {...revealMotion} className="map-wrapper">
            <iframe
              title="Officers Club map"
              className="map-frame"
              src="https://maps.google.com/maps?q=18.4886761,-67.1616232&ll=18.4886761,-67.1616232&z=15&output=embed"
              loading="lazy"
            />
            <div className="map-overlay">
              <a
                className="btn-primary"
                href="https://www.google.com/maps/dir/?api=1&destination=18.4886761,-67.1616232"
                target="_blank"
                rel="noopener noreferrer"
              >
                {content.location.button}
              </a>
            </div>
          </motion.div>
        </section>

        <section id="rsvp" className="rsvp-section">
          <motion.div {...revealMotion} className="section-inner">
            <div className="section-heading">
              <h2 className="rsvp-title">{content.rsvp.title}</h2>
              <p className="rsvp-subtitle">{content.rsvp.subtitle}</p>
            </div>
            <form className="rsvp-form" onSubmit={handleSubmit}>
              <label className="input-group">
                <span>{content.rsvp.nameLabel}</span>
                <input
                  type="text"
                  name={googleFormConfig?.name ?? 'entry.name'}
                  placeholder={content.rsvp.namePlaceholder}
                  required
                  className="input-field"
                />
              </label>

              <label className="input-group">
                <span>{content.rsvp.attendanceLabel}</span>
                <select name={googleFormConfig?.attendance ?? 'entry.attendance'} className="input-field" required>
                  <option value="yes">{content.rsvp.attendanceYes}</option>
                  <option value="no">{content.rsvp.attendanceNo}</option>
                </select>
              </label>

              <label className="input-group">
                <span>{content.rsvp.guestsLabel}</span>
                <input
                  type="number"
                  name={googleFormConfig?.guests ?? 'entry.guests'}
                  min={1}
                  max={6}
                  defaultValue={1}
                  className="input-field"
                />
              </label>

              <label className="input-group">
                <span>{content.rsvp.songLabel}</span>
                <input
                  type="text"
                  name={googleFormConfig?.song ?? 'entry.song'}
                  placeholder={content.rsvp.songPlaceholder}
                  className="input-field"
                />
              </label>

              <button className="btn-primary w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? content.rsvp.submitting : content.rsvp.submit}
              </button>
              <p className="text-center text-xs text-boda-forest/70">
                {googleFormConfig ? 'Google Forms' : content.rsvp.missingEndpoint}
              </p>
            </form>
          </motion.div>
        </section>
      </main>
    </div>
  )
}
