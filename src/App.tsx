import React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useEventState, type EventState } from './hooks/useEventState'
import { useRsvpStatus } from './hooks/useRsvpStatus'
import { useGuestAuth } from './hooks/useGuestAuth'
import { useActiveSection } from './hooks/useActiveSection'
import { DuringWedding } from './components/DuringWedding'
import { AfterWedding } from './components/AfterWedding'
import { GuestRsvpForm } from './components/GuestRsvpForm'
import { FAQElegant } from './components/FAQElegant'
import { SpotlightCard, TiltedCard } from './components/react-bits'
// React Icons
import { HiUsers } from 'react-icons/hi2' // Plus One - couple
import { HiBuildingOffice2 } from 'react-icons/hi2' // Hotel
import { HiPaperAirplane } from 'react-icons/hi2' // Plane
import { HiHeart } from 'react-icons/hi2' // Heart
import { MdCheckroom } from 'react-icons/md' // Dress
import { MdChildCare } from 'react-icons/md' // Children/Kid

type Language = 'es' | 'en'

const planeIcon = (
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
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
)

const mapPinIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const plateIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <circle cx="12" cy="12" r="7" />
  </svg>
)

const mealIconStyle = { strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const mealIcon = (paths: React.ReactNode) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="shrink-0" {...mealIconStyle}>
    {paths}
  </svg>
)
const mealIconBreakfast = mealIcon(
  <>
    <path d="M18 8h-2a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h2" />
    <path d="M6 8h2a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H6" />
    <path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
    <path d="M8 16v2" />
    <path d="M16 16v2" />
  </>
)
const mealIconLunch = mealIcon(
  <>
    <circle cx="12" cy="12" r="5" />
    <path d="M12 2v3" />
    <path d="M12 19v3" />
    <path d="m4.93 4.93 2.12 2.12" />
    <path d="m17 17 2.12 2.12" />
    <path d="M2 12h3" />
    <path d="M19 12h3" />
    <path d="m4.93 19.07 2.12-2.12" />
    <path d="m17 7 2.12-2.12" />
  </>
)
const mealIconDinner = mealIcon(<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />)
const mealIconDesserts = mealIcon(
  <>
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
    <path d="M4 13h16" />
    <path d="M6 13V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
  </>
)
const mealIconCafe = mealIcon(
  <>
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z" />
  </>
)

const MEAL_ICONS: Record<string, React.ReactNode> = {
  breakfast: mealIconBreakfast,
  lunch: mealIconLunch,
  dinner: mealIconDinner,
  desserts: mealIconDesserts,
  cafe: mealIconCafe,
}

const volumeOnIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
)

const volumeOffIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
)

// FAQ icons using react-icons with terracotta color
const faqIconWrapper = (IconComponent: React.ComponentType<any>) => (
  <div className="faq-icon-modern">
    <IconComponent className="faq-icon-svg" color="#E89C7C" size={20} />
  </div>
)

// Plus One - Couple icon
const faqIconPlusOne = faqIconWrapper(HiUsers)

// Hotel - Building icon
const faqIconHotel = faqIconWrapper(HiBuildingOffice2)

// Plane - Airplane icon
const faqIconPlane = faqIconWrapper(HiPaperAirplane)

// Heart - Heart icon
const faqIconHeart = faqIconWrapper(HiHeart)

// Children - Kid/Child icon
const faqIconChildren = faqIconWrapper(MdChildCare)

// Dress - Dress/Checkroom icon
const faqIconDress = faqIconWrapper(MdCheckroom)

const copy = {
  es: {
    codeEntry: {
      title: 'Invitación Privada',
      subtitle: 'Ingresa tu código de invitado para acceder',
      placeholder: 'CÓDIGO',
      button: 'ENTRAR',
      loading: 'VERIFICANDO...',
      error: 'Código inválido. Verifica e intenta de nuevo.',
      hint: 'El código está en tu invitación física',
    },
    nav: {
      faq: 'Preguntas',
      location: 'Ubicación',
      travel: 'Viaje',
      gifts: 'Regalos',
      rsvp: 'Reservar',
      toggle: 'EN / ES',
      menuOpen: 'Abrir menú',
      menuClose: 'Cerrar menú',
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
          icon: faqIconPlusOne,
          question: '¿Puedo traer un invitado (+1)?',
          answer:
            'Nos encantaría celebrar con todos, sin embargo, solo los invitados con un +1 incluido podrán traer acompañante. Si su invitación lo incluye, lo verá claramente indicado.',
        },
        {
          key: 'hotel',
          icon: faqIconHotel,
          question: '¿Hay un bloque de hotel reservado?',
          answer:
            'Sí. Hemos reservado un bloque de habitaciones en Parador Punta Borinquen, Aguadilla, PR 00603. Para recibir la tarifa con descuento, puede utilizar la boda como referencia al momento de hacer su reservación.',
        },
        {
          key: 'airport',
          icon: faqIconPlane,
          question: '¿Qué aeropuerto debo utilizar para llegar?',
          answer:
            'Puerto Rico es una isla accesible y fácil de recorrer. Si planea hospedarse en el área oeste, le recomendamos llegar al Aeropuerto Rafael Hernández (BQN) en Aguadilla.',
        },
        {
          key: 'children',
          icon: faqIconChildren,
          question: '¿Pueden asistir niños?',
          answer:
            'Amamos a todos los peques, pero hemos decidido que nuestra ceremonia y recepción serán solo para adultos. Los invitamos a aprovechar esta ocasión como un date night.',
        },
        {
          key: 'dresscode',
          icon: faqIconDress,
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
      title: 'Reservación',
      subtitle: 'Confirmar asistencia',
      nameLabel: 'Invitado',
      namePlaceholder: 'Tu nombre y apellido',
      attendanceLabel: '¿Asistirás?',
      attendanceYes: 'Sí, celebraré con ustedes',
      attendanceNo: 'Lo siento, no podré ir',
      guestsLabel: 'Invitados totales',
      songLabel: '¿Qué canción te gustaría bailar?',
      songPlaceholder: 'Ej. Callaita - Bad Bunny',
      submit: 'ENVIAR',
      submitting: 'ENVIANDO...',
      success: '¡Gracias! Recibimos tu reservación.',
      error: 'Hubo un problema. Inténtalo de nuevo.',
      checkSheet: '¡Gracias! Tu respuesta debería estar en la hoja. Si no la ves, inténtalo de nuevo.',
      missingEndpoint: 'Configura el enlace del Google Form para enviar.',
      spotifyButton: 'Playlist',
      spotifyTitle: 'Escucha las canciones de la boda',
      spotifyHint: '🎵 ¡Escucha la playlist con las canciones que todos sugirieron!',
      alreadySubmitted: '¡Ya confirmaste tu asistencia! Gracias.',
      plusOneQuestion: '¿Traerás a tu acompañante?',
      plusOneYes: 'Sí',
      plusOneNo: 'No',
      confirmButton: '¡CONFIRMO MI ASISTENCIA!',
      declineButton: 'Lo siento, no podré asistir',
      alreadySubmittedMessage: '¡Ya confirmaste tu asistencia!',
    },
    footer: {
      credits: 'Creado con cariño para Deyaneira & Aaron',
      by: 'alexberrios.com',
    },
    calendar: {
      add: 'Agregar al calendario',
    },
    intro: {
      hint: 'Descubre',
      letterNames: 'Deyaneira & Aaron',
      letterDate: '07.18.26',
    },
    gifts: {
      title: 'Regalos & Luna de Miel',
      paragraphs: [
        'Tenemos la dicha de ya contar con un hogar lleno de amor, risas y completamente amueblado.',
        'Si desean celebrar este nuevo capítulo con nosotros, hemos creado un fondo para nuestra luna de miel y así seguir creando recuerdos inolvidables juntos.',
      ],
      payment: {
        ath: 'ATH Móvil',
        venmo: 'Venmo',
        zelle: 'Zelle',
      },
      note: 'Efectivo y cheques también serán recibidos con mucho cariño 🤍',
    },
    music: {
      mute: 'Silenciar música',
      unmute: 'Activar música',
    },
    travel: {
      title: 'Para tu viaje',
      flight: 'Reservar vuelo (NYC → Puerto Rico)',
      places: 'Lugares en Aguadilla',
      restaurantsLabel: 'Restaurantes',
      beachesLabel: 'Playas',
      mealBreakfast: 'Desayuno',
      mealLunch: 'Almuerzo',
      mealDinner: 'Cena',
      mealDesserts: 'Postres',
      mealCafe: 'Café',
      platea: 'Más recomendaciones en Platea PR',
      plateaUrl: 'https://www.plateapr.com/directorio/oeste/aguadilla',
      restaurants: [
        { name: 'Alba', url: 'https://www.google.com/maps/search/Alba+Aguadilla+Puerto+Rico', meal: 'breakfast' },
        { name: 'Sal De Mar', url: 'https://www.google.com/maps/search/Sal+De+Mar+Aguadilla+Puerto+Rico', meal: 'lunch' },
        { name: 'Monson', url: 'https://www.google.com/maps/search/Monson+Aguadilla+Puerto+Rico', meal: 'dinner' },
        { name: 'La Chocolateria', url: 'https://www.google.com/maps/search/La+Chocolateria+Aguadilla+Puerto+Rico', meal: 'desserts' },
        { name: 'Levian', url: 'https://www.google.com/maps/search/Levian+cafe+Aguadilla+Puerto+Rico', meal: 'cafe' },
      ],
      beaches: [
        { name: 'Crash Boat Beach', url: 'https://www.google.com/maps/search/Crash+Boat+Beach+Aguadilla+Puerto+Rico' },
        { name: 'Punta Borinquen', url: 'https://www.google.com/maps/search/Punta+Borinquen+Aguadilla+Puerto+Rico' },
        { name: 'Survival Beach (Playuela)', url: 'https://www.google.com/maps/search/Survival+Beach+Playuela+Aguadilla+Puerto+Rico' },
        { name: 'Peña Blanca', url: 'https://www.google.com/maps/search/Peña+Blanca+Beach+Aguadilla+Puerto+Rico' },
        { name: 'Las Ruinas (El Faro)', url: 'https://www.google.com/maps/search/El+Faro+Aguadilla+Puerto+Rico' },
      ],
    },
    during: {
      title: '¡Estamos Celebrando!',
      subtitle: 'Deyaneira & Aaron',
      message: 'En este momento estamos celebrando nuestro amor rodeados de familia y amigos bajo el atardecer puertorriqueño. Gracias por acompañarnos en este día tan especial.',
      location: 'Officers Club, Aguadilla',
      time: '5:00 PM – 11:00 PM',
      note: 'Pronto compartiremos fotos y recuerdos de esta noche mágica ✨',
    },
    after: {
      title: 'Gracias Por Celebrar Con Nosotros',
      messageMain: 'Nuestra boda fue más hermosa de lo que jamás imaginamos, y eso fue gracias a cada uno de ustedes. Su presencia, amor y energía convirtieron nuestro día especial en un recuerdo que guardaremos en el corazón para siempre.',
      messageSecondary: 'Gracias por bailar con nosotros bajo las estrellas de Puerto Rico, por sus risas, abrazos y por compartir la alegría de este nuevo capítulo en nuestras vidas.',
      signoff: 'Con todo nuestro amor,',
      comingSoonTitle: 'Recuerdos & Galería',
      comingSoonMessage: 'Pronto compartiremos las fotos profesionales de nuestra celebración y un mensaje especial para todos ustedes.',
      comingSoonNote: 'Este sitio se actualizará con nuestra galería de fotos y videos. ¡Vuelve pronto!',
      galleryTitle: 'Recuerdos de Nuestra Boda',
      galleryLoading: 'Cargando fotos...',
    },
  },
  en: {
    codeEntry: {
      title: 'Private Invitation',
      subtitle: 'Enter your guest code to access',
      placeholder: 'CODE',
      button: 'ENTER',
      loading: 'VERIFYING...',
      error: 'Invalid code. Please check and try again.',
      hint: 'The code is on your physical invitation',
    },
    nav: {
      faq: 'FAQ',
      location: 'Location',
      travel: 'Travel',
      gifts: 'Gifts',
      rsvp: 'RSVP',
      toggle: 'ES / EN',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
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
          icon: faqIconPlusOne,
          question: 'Can I bring a guest (+1)?',
          answer:
            'We would love to celebrate with everyone; however, only guests with a +1 indicated on their invitation may bring an additional guest.',
        },
        {
          key: 'hotel',
          icon: faqIconHotel,
          question: 'Is there a hotel room block available?',
          answer:
            'Yes! A room block has been reserved at Parador Punta Borinquen, Aguadilla, PR 00603. Please mention the wedding when booking to receive the discounted rate.',
        },
        {
          key: 'airport',
          icon: faqIconPlane,
          question: 'Which airport should I use when traveling?',
          answer:
            'Puerto Rico is easy to navigate. If you plan to stay in the western area, we recommend flying into Rafael Hernández Airport (BQN) in Aguadilla.',
        },
        {
          key: 'children',
          icon: faqIconChildren,
          question: 'Are children allowed to attend?',
          answer:
            'While we love all little ones, we have decided to make our ceremony and reception adults-only. Enjoy a special date night.',
        },
        {
          key: 'dresscode',
          icon: faqIconDress,
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
      nameLabel: 'Name',
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
      checkSheet: 'Thank you! Your response should be in the sheet. If you don’t see it, try again.',
      missingEndpoint: 'Set the Google Form link to submit.',
      spotifyButton: 'Playlist',
      spotifyTitle: 'Listen to the wedding songs',
      spotifyHint: '🎵 Listen to the playlist with songs everyone suggested!',
      alreadySubmitted: 'You already confirmed your attendance! Thank you.',
      alreadySubmittedMessage: 'You already confirmed your attendance!',
      plusOneQuestion: 'Will you bring your plus one?',
      plusOneYes: 'Yes',
      plusOneNo: 'No',
      confirmButton: 'CONFIRM ATTENDANCE!',
      declineButton: 'Sorry, could not attend',
    },
    footer: {
      credits: 'Made with care for Deyaneira & Aaron',
      by: 'alexberrios.com',
    },
    calendar: {
      add: 'Add to calendar',
    },
    intro: {
      hint: 'Discover',
      letterNames: 'Deyaneira & Aaron',
      letterDate: '07.18.26',
    },
    gifts: {
      title: 'Gifts & Honeymoon Fund',
      paragraphs: [
        "We're lucky enough to already have a home full of love, laughter, and furniture.",
        "If you'd like to celebrate with us, we've created a honeymoon fund to help us make unforgettable memories together.",
      ],
      payment: {
        ath: 'ATH Móvil',
        venmo: 'Venmo',
        zelle: 'Zelle',
      },
      note: 'Cash and checks are also lovingly appreciated 🤍',
    },
    music: {
      mute: 'Mute music',
      unmute: 'Unmute music',
    },
    travel: {
      title: 'For your trip',
      flight: 'Book a flight (NYC → Puerto Rico)',
      places: 'Places in Aguadilla',
      restaurantsLabel: 'Restaurants',
      beachesLabel: 'Beaches',
      mealBreakfast: 'Breakfast',
      mealLunch: 'Lunch',
      mealDinner: 'Dinner',
      mealDesserts: 'Desserts',
      mealCafe: 'Café',
      platea: 'More recommendations on Platea PR',
      plateaUrl: 'https://www.plateapr.com/directorio/oeste/aguadilla',
      restaurants: [
        { name: 'Alba', url: 'https://www.google.com/maps/search/Alba+Aguadilla+Puerto+Rico', meal: 'breakfast' },
        { name: 'Sal De Mar', url: 'https://www.google.com/maps/search/Sal+De+Mar+Aguadilla+Puerto+Rico', meal: 'lunch' },
        { name: 'Monson', url: 'https://www.google.com/maps/search/Monson+Aguadilla+Puerto+Rico', meal: 'dinner' },
        { name: 'La Chocolateria', url: 'https://www.google.com/maps/search/La+Chocolateria+Aguadilla+Puerto+Rico', meal: 'desserts' },
        { name: 'Levian', url: 'https://www.google.com/maps/search/Levian+cafe+Aguadilla+Puerto+Rico', meal: 'cafe' },
      ],
      beaches: [
        { name: 'Crash Boat Beach', url: 'https://www.google.com/maps/search/Crash+Boat+Beach+Aguadilla+Puerto+Rico' },
        { name: 'Punta Borinquen', url: 'https://www.google.com/maps/search/Punta+Borinquen+Aguadilla+Puerto+Rico' },
        { name: 'Survival Beach (Playuela)', url: 'https://www.google.com/maps/search/Survival+Beach+Playuela+Aguadilla+Puerto+Rico' },
        { name: 'Peña Blanca', url: 'https://www.google.com/maps/search/Peña+Blanca+Beach+Aguadilla+Puerto+Rico' },
        { name: 'Las Ruinas (El Faro)', url: 'https://www.google.com/maps/search/El+Faro+Aguadilla+Puerto+Rico' },
      ],
    },
    during: {
      title: 'We Are Celebrating!',
      subtitle: 'Deyaneira & Aaron',
      message: 'Right now we are celebrating our love surrounded by family and friends under the Puerto Rican sunset. Thank you for being part of this special day.',
      location: 'Officers Club, Aguadilla',
      time: '5:00 PM – 11:00 PM',
      note: 'We will soon share photos and memories from this magical night ✨',
    },
    after: {
      title: 'Thank You For Celebrating With Us',
      messageMain: 'Our wedding was more beautiful than we ever imagined, and that was because of each and every one of you. Your presence, love, and energy turned our special day into a memory we will cherish in our hearts forever.',
      messageSecondary: 'Thank you for dancing with us under the Puerto Rican stars, for your laughter, hugs, and for sharing the joy of this new chapter in our lives.',
      signoff: 'With all our love,',
      comingSoonTitle: 'Memories & Gallery',
      comingSoonMessage: 'We will soon share professional photos from our celebration and a special message for all of you.',
      comingSoonNote: 'This site will be updated with our photo and video gallery. Come back soon!',
      galleryTitle: 'Memories From Our Wedding',
      galleryLoading: 'Loading photos...',
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
// Google Flights search for roundtrip flights from NYC to San Juan, Puerto Rico
// Google Flights defaults to roundtrip when searching
const flightSearchUrl = 'https://www.google.com/travel/flights/flights-from-new-york-to-san-juan.html'

// Playlist URLs - update with your actual playlists
const SPOTIFY_PLAYLIST_URL = import.meta.env.VITE_SPOTIFY_PLAYLIST_URL || 'https://open.spotify.com/playlist/YOUR_PLAYLIST_ID'
const APPLE_MUSIC_PLAYLIST_URL = import.meta.env.VITE_APPLE_MUSIC_PLAYLIST_URL || ''

const spotifyIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
)

const globeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
    <path d="M2 12h20"/>
  </svg>
)

const giftIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="4" rx="1"/>
    <path d="M12 8v13"/>
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
  </svg>
)

// Payment method logos - using official logos
const venmoIcon = (
  <img 
    src="https://images.ctfassets.net/gkyt4bl1j2fs/ym6BkLqyGjMBmiCwtM7AW/829bf561ea771c00839b484cb8edeebb/App_Icon.png?w=276&h=276&q=50&fm=webp&bg=transparent"
    alt="Venmo"
    className="payment-logo"
    loading="lazy"
  />
)

const zelleIcon = (
  <img 
    src="https://cdn.brandfetch.io/idzVXa6fkl/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B"
    alt="Zelle"
    className="payment-logo"
    loading="lazy"
  />
)

const athMovilIcon = (
  <img 
    src="https://portal.athmovil.com/images/individuos/athm-circle-logo.svg"
    alt="ATH Móvil"
    className="payment-logo"
    loading="lazy"
  />
)

const appleMusicIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
    <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.99c-.042.003-.083.01-.124.013-.5.032-1 .09-1.5.18-.5.09-.97.25-1.4.47a4.9 4.9 0 00-1.68 1.33c-.47.53-.79 1.15-.98 1.83-.16.56-.25 1.14-.29 1.72-.01.12-.02.25-.02.37v11.68c.01.14.02.28.03.42.04.54.12 1.07.27 1.59.21.73.56 1.37 1.08 1.93a4.9 4.9 0 001.77 1.27c.56.23 1.15.37 1.76.44.52.06 1.04.09 1.56.1h12.06c.53-.01 1.06-.04 1.59-.1.56-.07 1.11-.2 1.63-.41a4.9 4.9 0 002-1.48c.49-.61.82-1.3.99-2.05.13-.58.21-1.17.24-1.77.01-.12.02-.25.02-.37V6.5c0-.13-.01-.26-.02-.38zm-6.15 3.27v7.93c0 .56-.11 1.1-.35 1.6-.24.5-.6.93-1.06 1.24-.39.27-.82.46-1.29.56-.55.12-1.1.14-1.65.05-.64-.1-1.22-.36-1.7-.78-.49-.43-.81-.97-.95-1.61-.14-.64-.07-1.27.19-1.87.26-.6.69-1.07 1.26-1.39.33-.19.68-.33 1.05-.42.41-.1.83-.15 1.25-.14.3.01.59.04.88.11v-4.53l-5.5 1.17v6.93c0 .57-.11 1.11-.35 1.62-.24.5-.6.93-1.07 1.24-.39.26-.82.45-1.29.54-.55.12-1.1.13-1.65.04-.64-.1-1.21-.36-1.69-.78-.49-.43-.81-.97-.96-1.61-.14-.64-.08-1.27.19-1.87.26-.6.69-1.07 1.26-1.38.33-.19.68-.33 1.05-.42.41-.1.83-.14 1.24-.13.3.01.6.04.89.11V8.3c0-.28.05-.55.15-.81.1-.26.25-.49.44-.68.23-.24.51-.41.82-.5.32-.1.65-.14.98-.2l6.52-1.37c.27-.06.55-.08.83-.06.28.02.55.09.8.21.25.12.46.3.62.52.16.23.26.49.29.77z"/>
  </svg>
)

// Detect browser language
function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'es'
  
  // Check navigator.languages first (more accurate)
  const languages = navigator.languages || [navigator.language]
  
  for (const lang of languages) {
    const langCode = lang.toLowerCase().split('-')[0]
    if (langCode === 'en') {
      return 'en'
    }
    if (langCode === 'es') {
      return 'es'
    }
  }
  
  // Fallback to navigator.language
  const browserLang = navigator.language?.toLowerCase().split('-')[0]
  if (browserLang === 'en') {
    return 'en'
  }
  
  // Default to Spanish
  return 'es'
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => detectLanguage())
  const [countdown, setCountdown] = useState(getCountdown)
  const [showIntro, setShowIntro] = useState(true)
  const [introState, setIntroState] = useState<'closed' | 'opening' | 'revealed'>('closed')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [isValidatingCode, setIsValidatingCode] = useState(false)
  const introCompleted = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rsvpSubmitGuardRef = useRef(false)
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const authCheckedRef = useRef(false)
  const prefersReducedMotion = useReducedMotion()
  const navLinksRef = useRef<{ [key: string]: HTMLAnchorElement | null }>({})
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 })

  // Detect event state (before, during, after)
  const eventState = useEventState()

  // Guest authentication
  const { 
    isAuthenticated, 
    isLoading: isAuthLoading, 
    guest, 
    validateCode, 
    submitRsvp: submitGuestRsvp 
  } = useGuestAuth()

  // RSVP status tracking (server-side) - used as fallback
  const { hasSubmitted: rsvpSubmitted, checkRsvpStatus, registerRsvp, isChecking: isCheckingRsvp } = useRsvpStatus()

  // Active section detection for navbar indicator
  const activeSection = useActiveSection()

  // Update indicator position based on active section
  useEffect(() => {
    const activeLink = navLinksRef.current[activeSection]
    if (activeLink && activeSection !== 'rsvp') {
      const container = activeLink.parentElement
      if (container) {
        const containerRect = container.getBoundingClientRect()
        const linkRect = activeLink.getBoundingClientRect()
        setIndicatorStyle({
          left: linkRect.left - containerRect.left,
          width: linkRect.width,
          opacity: 1,
        })
      }
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }))
    }
  }, [activeSection])

  // Guest has confirmed if they're authenticated and hasConfirmed is true
  const guestHasConfirmed = isAuthenticated && guest?.hasConfirmed

  // Hide envelope if user is already authenticated via cookie (returning visitor)
  // Only run once when initial auth check completes
  useEffect(() => {
    if (isAuthLoading) return // Wait for initial auth check to complete
    
    // Only check once
    if (authCheckedRef.current) return
    authCheckedRef.current = true
    
    if (isAuthenticated) {
      // User is already authenticated via cookie, skip envelope completely
      setShowIntro(false)
      setIntroState('revealed')
      introCompleted.current = true
    } else {
      // User is not authenticated, show envelope with code entry
      setShowIntro(true)
      setIntroState('closed')
    }
  }, [isAuthLoading, isAuthenticated]) // Run when auth state changes
  
  // Also ensure envelope stays hidden if user becomes authenticated later
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && showIntro) {
      setShowIntro(false)
      setIntroState('revealed')
      introCompleted.current = true
    }
  }, [isAuthenticated, isAuthLoading, showIntro])

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
    if (prefersReducedMotion) {
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

  // Consolidated scroll blocking: block scroll when envelope is not revealed
  useEffect(() => {
    // Don't block scroll for during/after states
    if (eventState !== 'before') {
      document.body.style.overflow = ''
      document.body.style.height = ''
      document.body.style.position = ''
      document.body.style.width = ''
      return
    }
    
    // Block scroll if intro is showing AND not yet revealed
    const shouldBlockScroll = showIntro && introState !== 'revealed'
    
    if (shouldBlockScroll) {
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.height = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    
    // Cleanup: restore scroll when component unmounts or dependencies change
    return () => {
      // Only reset if we're still in 'before' state (otherwise another effect might handle it)
      if (eventState === 'before') {
        document.body.style.overflow = ''
        document.body.style.height = ''
        document.body.style.position = ''
        document.body.style.width = ''
      }
    }
  }, [introState, showIntro, eventState])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) setNavOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleIntroComplete = () => {
    if (introCompleted.current) return
    introCompleted.current = true
    setShowIntro(false)
    setIntroState('revealed')
  }

  const openEnvelope = () => {
    setIntroState('opening')
    handleStartMusic()
    window.setTimeout(handleIntroComplete, prefersReducedMotion ? 0 : 3200)
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (introState !== 'closed') return
    if (!accessCode.trim()) {
      setCodeError(content.codeEntry.error)
      return
    }

    setIsValidatingCode(true)
    setCodeError(null)

    const result = await validateCode(accessCode.trim())

    if (result.success) {
      // Code is valid, open the envelope!
      openEnvelope()
    } else {
      setCodeError(result.error || content.codeEntry.error)
      setIsValidatingCode(false)
    }
  }

  // For users who are already authenticated (returning visitors)
  const handleIntroOpen = () => {
    if (introState !== 'closed') return
    if (isAuthenticated) {
      openEnvelope()
    }
    // If not authenticated, they must use the code input
  }

  const toggleLanguage = () => {
    setLang(prev => (prev === 'es' ? 'en' : 'es'))
  }

  const handleStartMusic = async () => {
    const audio = audioRef.current
    if (!audio || isMuted) return
    audio.volume = 0.5
    audio.muted = false
    try {
      await audio.play()
    } catch {
      // ignore autoplay restrictions
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (isMuted) {
      setIsMuted(false)
      if (audio) {
        audio.muted = false
        audio.play().catch(() => {})
      }
    } else {
      setIsMuted(true)
      if (audio) audio.muted = true
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!googleFormConfig) {
      toast.error(content.rsvp.missingEndpoint)
      return
    }
    if (rsvpSubmitGuardRef.current) return
    rsvpSubmitGuardRef.current = true
    setIsSubmitting(true)
    try {
      const form = event.currentTarget
      const formData = new FormData(form)
      
      // Extract form values
      const name = String(formData.get(googleFormConfig.name) || '').trim()
      const attendance = String(formData.get(googleFormConfig.attendance) || 'yes')
      const guestsName = googleFormConfig.guests
      const g = Math.min(2, Math.max(1, parseInt(String(formData.get(guestsName) ?? 1), 10) || 1))
      formData.set(guestsName, String(g))
      const song = String(formData.get(googleFormConfig.song) || '')

      // Check if already submitted (server-side)
      const alreadySubmitted = await checkRsvpStatus(name)
      if (alreadySubmitted) {
        toast.error(content.rsvp.alreadySubmitted)
        rsvpSubmitGuardRef.current = false
        setIsSubmitting(false)
        return
      }

      // Submit to Google Forms
      await fetch(googleFormConfig.action, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      })

      // Register in our server (for duplicate prevention)
      await registerRsvp(name, attendance, g, song)

      toast.success(content.rsvp.success)
      form.reset()
    } catch {
      // With no-cors, fetch can reject (e.g. redirect) even when the form was received.
      toast.success(content.rsvp.checkSheet)
    } finally {
      rsvpSubmitGuardRef.current = false
      setIsSubmitting(false)
    }
  }

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-boda-cream flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    )
  }

  // Show code entry if not authenticated
  return (
    <div className="min-h-screen bg-boda-cream text-boda-text">
      <Toaster position="top-center" />
      <audio ref={audioRef} src="/audio/tqm.mp3" loop preload="auto" />
      <AnimatePresence>
        {eventState === 'before' && showIntro ? (
          <motion.div
            className="intro-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            onClick={isAuthenticated ? handleIntroOpen : undefined}
          >
            <div className="intro-bg" aria-hidden="true" />
            <div className="intro-leaf" aria-hidden="true" />
            <motion.div
              className="intro-envelope"
              initial={{ scale: 1, y: 0 }}
              animate={introState === 'opening' ? { scale: 1.02, y: -12 } : { scale: 1, y: 0 }}
              whileHover={introState === 'closed' && isAuthenticated ? { y: -8 } : {}}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: easeCurve }}
              onClick={isAuthenticated ? handleIntroOpen : undefined}
              style={{ cursor: isAuthenticated ? 'pointer' : 'default' }}
            >
              <div className="envelope-shell">
                <div className="envelope-body">
                  <span className="envelope-title">
                    D <span className="envelope-amp">&amp;</span> A
                  </span>
                </div>
                <motion.div
                  className="envelope-flap"
                  animate={introState === 'opening' ? { y: -90, opacity: 0 } : { y: 0, opacity: 1 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.9, ease: [0.4, 0, 0.2, 1] }}
                />
                <div className="envelope-letter">
                  <motion.div
                    className="envelope-letter-card"
                    animate={
                      introState === 'opening'
                        ? { y: -180, scale: 1, opacity: 1 }
                        : { y: 0, scale: 0.9, opacity: 0 }
                    }
                    transition={{
                      y: { duration: prefersReducedMotion ? 0 : 1.4, ease: easeCurve, delay: 0.5 },
                      scale: { duration: prefersReducedMotion ? 0 : 1.4, ease: easeCurve, delay: 0.5 },
                      opacity: { duration: prefersReducedMotion ? 0 : 0.3, delay: 0.5 },
                    }}
                  >
                    <div className="letter-content">
                      <span className="letter-names">{content.intro.letterNames}</span>
                      <span className="letter-date">{content.intro.letterDate}</span>
                    </div>
                  </motion.div>
                </div>
                <motion.div
                  className="envelope-shadow"
                  animate={introState === 'opening' ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
                />
              </div>
            </motion.div>

            {/* Code entry form - shown when not authenticated */}
            {!isAuthenticated && introState === 'closed' && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="envelope-code-form"
                onSubmit={handleCodeSubmit}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="envelope-code-hint">{content.codeEntry.subtitle}</p>
                <div className="envelope-code-input-wrap">
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    placeholder={content.codeEntry.placeholder}
                    className="envelope-code-input"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    disabled={isValidatingCode}
                  />
                  <button
                    type="submit"
                    className="envelope-code-btn"
                    disabled={isValidatingCode || !accessCode.trim()}
                  >
                    {isValidatingCode ? (
                      <span className="envelope-code-spinner" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {codeError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="envelope-code-error"
                    >
                      {codeError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.form>
            )}

            {/* Dots hint - only for authenticated users */}
            {isAuthenticated && (
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
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {(eventState !== 'before' || !showIntro) && (
        <button
          type="button"
          className="music-toggle hidden sm:flex"
          onClick={toggleMute}
          aria-label={isMuted ? content.music.unmute : content.music.mute}
          title={isMuted ? content.music.unmute : content.music.mute}
        >
          {isMuted ? volumeOffIcon : volumeOnIcon}
        </button>
      )}

      {/* Only show full navbar in 'before' state */}
      {eventState === 'before' ? (
        <nav className="nav-bar" aria-label="Main">
          <div className="nav-inner">
            {/* Mobile: Hamburger, RSVP, and language toggle in one row */}
            <div className="flex sm:hidden items-center justify-between w-full gap-2">
              <button
                type="button"
                className="nav-hamburger"
                onClick={() => setNavOpen(v => !v)}
                aria-expanded={navOpen}
                aria-label={navOpen ? content.nav.menuClose : content.nav.menuOpen}
              >
                {navOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 12h16" /><path d="M4 6h16" /><path d="M4 18h16" /></svg>
                )}
              </button>
              <a 
                href="#rsvp" 
                className={`nav-rsvp-btn-mobile flex-1 ${activeSection === 'rsvp' ? 'active' : ''}`}
              >
                {content.nav.rsvp}
              </a>
              <button type="button" className="nav-icon-btn" onClick={toggleLanguage} aria-label="Toggle language">
                {globeIcon}
              </button>
            </div>

            {/* Desktop: Nav links with indicator */}
            <div className="hidden sm:flex items-center gap-2 relative">
              <motion.div
                className="nav-indicator"
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                  opacity: indicatorStyle.opacity,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />
              <a 
                ref={(el) => { navLinksRef.current['faq'] = el }}
                className={`nav-link ${activeSection === 'faq' ? 'active' : ''}`} 
                href="#faq"
              >
                {content.nav.faq}
              </a>
              <span className="nav-sep" aria-hidden="true">·</span>
              <a 
                ref={(el) => { navLinksRef.current['location'] = el }}
                className={`nav-link ${activeSection === 'location' ? 'active' : ''}`} 
                href="#location"
              >
                {content.nav.location}
              </a>
              <span className="nav-sep" aria-hidden="true">·</span>
              <a 
                ref={(el) => { navLinksRef.current['travel'] = el }}
                className={`nav-link ${activeSection === 'travel' ? 'active' : ''}`} 
                href="#travel"
              >
                {content.nav.travel}
              </a>
            </div>

            {/* Desktop: RSVP, Gift, Language buttons */}
            <div className="hidden sm:flex items-center gap-2 relative">
              <a 
                ref={(el) => { navLinksRef.current['rsvp'] = el }}
                href="#rsvp" 
                className={`nav-rsvp-btn ${activeSection === 'rsvp' ? 'active' : ''}`}
              >
                {content.nav.rsvp}
              </a>
              <a href="#gifts" className="nav-icon-btn" aria-label={content.nav.gifts}>
                {giftIcon}
              </a>
              <button type="button" className="nav-icon-btn" onClick={toggleLanguage} aria-label="Toggle language">
                {globeIcon}
              </button>
            </div>
          </div>
          {navOpen && (
            <>
              <div className="nav-overlay sm:hidden" onClick={() => setNavOpen(false)} aria-hidden />
              <div className="nav-mobile-menu sm:hidden">
                <a href="#faq" className="nav-mobile-link" onClick={() => setNavOpen(false)}>{content.nav.faq}</a>
                <a href="#location" className="nav-mobile-link" onClick={() => setNavOpen(false)}>{content.nav.location}</a>
                <a href="#travel" className="nav-mobile-link" onClick={() => setNavOpen(false)}>{content.nav.travel}</a>
              </div>
            </>
          )}
        </nav>
      ) : (
        /* Minimal nav for during/after - just language toggle */
        <div className="nav-minimal">
          <button type="button" className="nav-icon-btn" onClick={toggleLanguage} aria-label="Toggle language">
            {globeIcon}
          </button>
        </div>
      )}

      {/* DURING STATE: Live celebration message */}
      {eventState === 'during' && (
        <DuringWedding content={content.during} />
      )}

      {/* AFTER STATE: Thank you message */}
      {eventState === 'after' && (
        <AfterWedding content={content.after} lang={lang} />
      )}

      {/* BEFORE STATE: Normal invitation site */}
      {eventState === 'before' && (
        <>
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
        {/* FAQ Section - Elegant Accordion */}
        <FAQElegant
          title={content.faq.title}
          items={content.faq.items}
          dressCodeColors={swatchColors}
        />

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

        <section id="gifts" className="gifts-section">
          <motion.div {...revealMotion} className="section-inner">
            <div className="gifts-icon" aria-hidden="true">
              <div className="gifts-heart-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" className="gifts-heart-svg">
                  <path 
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                    stroke="#E89C7C" 
                    strokeWidth="2" 
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="gifts-heading">
              <h2>{content.gifts.title}</h2>
            </div>
            <div className="gifts-copy">
              {content.gifts.paragraphs.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="gifts-box" role="list">
              <div className="gifts-line" role="listitem">
                <span className="gifts-payment-label">
                  {athMovilIcon}
                  {content.gifts.payment.ath}:
                </span>
                <strong>787-516-1189</strong>
              </div>
              <div className="gifts-line" role="listitem">
                <span className="gifts-payment-label">
                  {venmoIcon}
                  {content.gifts.payment.venmo}:
                </span>
                <a 
                  href="https://venmo.com/akfy910" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="gifts-payment-link"
                >
                  @akfy910
                </a>
              </div>
              <div className="gifts-line" role="listitem">
                <span className="gifts-payment-label">
                  {zelleIcon}
                  {content.gifts.payment.zelle}:
                </span>
                <a 
                  href="tel:5162160869" 
                  className="gifts-payment-link"
                >
                  516-216-0869
                </a>
              </div>
            </div>
            <p className="gifts-note">{content.gifts.note}</p>
          </motion.div>
        </section>

        <section id="travel" className="travel-section" aria-label={content.travel.title}>
          <motion.div {...revealMotion} className="section-inner">
            <div className="section-heading">
              <h2 className="travel-title">{content.travel.title}</h2>
            </div>
            <div className="travel-buttons">
              <a
                href={flightSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="travel-btn travel-btn-flight"
              >
                {planeIcon}
                <span>{content.travel.flight}</span>
              </a>
              <details className="travel-details">
                <summary className="travel-btn travel-btn-places">
                  {mapPinIcon}
                  <span>{content.travel.places}</span>
                  <span className="travel-chevron" aria-hidden="true" />
                </summary>
                <div className="travel-places-inner">
                  {/* Restaurants with SpotlightCards */}
                  <p className="travel-subsection">{content.travel.restaurantsLabel}</p>
                  <div className="travel-restaurants-grid">
                    {content.travel.restaurants.map((r, index) => {
                      const mealLabel = content.travel[({ breakfast: 'mealBreakfast', lunch: 'mealLunch', dinner: 'mealDinner', desserts: 'mealDesserts', cafe: 'mealCafe' } as const)[r.meal]]
                      const mealColors: Record<string, { color: string; spotlight: string }> = {
                        breakfast: { color: '#FFB347', spotlight: '255, 179, 71' },
                        lunch: { color: '#87CEEB', spotlight: '135, 206, 235' },
                        dinner: { color: '#9B7EDE', spotlight: '155, 126, 222' },
                        desserts: { color: '#FFB6C1', spotlight: '255, 182, 193' },
                        cafe: { color: '#C19A6B', spotlight: '193, 154, 107' },
                      }
                      const config = mealColors[r.meal]
                      return (
                        <motion.div
                          key={r.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                        >
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="travel-card-link">
                            <SpotlightCard className="travel-restaurant-card" spotlightColor={config.spotlight}>
                              <div className="travel-card-icon" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                                {MEAL_ICONS[r.meal]}
                              </div>
                              <div className="travel-card-info">
                                <span className="travel-card-tag" style={{ backgroundColor: `${config.color}30`, color: config.color }}>
                                  {mealLabel}
                                </span>
                                <span className="travel-card-name">{r.name}</span>
                              </div>
                              <div className="travel-card-arrow">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                                </svg>
                              </div>
                            </SpotlightCard>
                          </a>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Beaches with TiltedCards */}
                  <p className="travel-subsection">{content.travel.beachesLabel}</p>
                  <div className="travel-beaches-cards">
                    {content.travel.beaches.map((place, index) => (
                      <motion.div
                        key={place.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                      >
                        <a href={place.url} target="_blank" rel="noopener noreferrer" className="travel-card-link">
                          <TiltedCard className="travel-beach-card" maxTilt={8} scale={1.02}>
                            <div className="travel-beach-content">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="travel-beach-icon">
                                <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                              </svg>
                              <span className="travel-beach-name">{place.name}</span>
                            </div>
                          </TiltedCard>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="travel-platea-wrap">
                  <a
                    href={content.travel.plateaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="travel-platea-btn"
                  >
                    {plateIcon}
                    <span>{content.travel.platea}</span>
                  </a>
                </div>
              </details>
            </div>
          </motion.div>
        </section>

        <section id="rsvp" className="rsvp-section">
          <motion.div {...revealMotion} className="section-inner">
            <div className="section-heading">
              <h2 className="rsvp-title">{content.rsvp.title}</h2>
              <p className="rsvp-subtitle">{content.rsvp.subtitle}</p>
            </div>

            {(guestHasConfirmed || rsvpSubmitted) ? (
              /* Already confirmed - show thank you message and Spotify */
              <div className="rsvp-confirmed">
                <div className="rsvp-confirmed-icon">✓</div>
                <p className="rsvp-confirmed-message">{content.rsvp.alreadySubmittedMessage}</p>
                {guest && (
                  <p className="rsvp-confirmed-name">{guest.name}</p>
                )}
                <div className="playlist-buttons">
                  <a
                    href={SPOTIFY_PLAYLIST_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-spotify btn-spotify-large"
                    title={content.rsvp.spotifyTitle}
                  >
                    {spotifyIcon}
                    <span>Spotify</span>
                  </a>
                  {APPLE_MUSIC_PLAYLIST_URL && (
                    <a
                      href={APPLE_MUSIC_PLAYLIST_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-apple-music"
                      title="Apple Music"
                    >
                      {appleMusicIcon}
                      <span>Apple Music</span>
                    </a>
                  )}
                </div>
                <p className="rsvp-spotify-hint">{content.rsvp.spotifyHint}</p>
              </div>
            ) : guest ? (
              /* Dynamic RSVP form based on guest data */
              <GuestRsvpForm
                guest={guest}
                content={content.rsvp}
                googleFormConfig={googleFormConfig}
                onSubmit={async (attendance, totalGuests, song) => {
                  setIsSubmitting(true)
                  try {
                    // Submit to Notion
                    await submitGuestRsvp(attendance, totalGuests, song)
                    
                    // Also submit to Google Forms
                    if (googleFormConfig) {
                      const formData = new FormData()
                      formData.set(googleFormConfig.name, guest.name)
                      formData.set(googleFormConfig.attendance, attendance)
                      formData.set(googleFormConfig.guests, String(totalGuests))
                      formData.set(googleFormConfig.song, song)
                      
                      await fetch(googleFormConfig.action, {
                        method: 'POST',
                        mode: 'no-cors',
                        body: formData,
                      })
                    }
                    
                    toast.success(content.rsvp.success)
                  } catch {
                    toast.error(content.rsvp.error)
                  } finally {
                    setIsSubmitting(false)
                  }
                }}
                isSubmitting={isSubmitting}
              />
            ) : (
              /* Fallback form if no guest data */
              <form className="rsvp-form" onSubmit={handleSubmit}>
                <label className="input-group">
                  <span>{content.rsvp.nameLabel}</span>
                  <input
                    ref={nameInputRef}
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
                    max={2}
                    defaultValue={1}
                    required
                    className="input-field"
                  />
                </label>

                <label className="input-group">
                  <span>{content.rsvp.songLabel}</span>
                  <input
                    type="text"
                    name={googleFormConfig?.song ?? 'entry.song'}
                    placeholder={content.rsvp.songPlaceholder}
                    required
                    className="input-field"
                  />
                </label>

                <button 
                  className="btn-primary w-full" 
                  type="submit" 
                  disabled={isSubmitting || isCheckingRsvp}
                >
                  {isSubmitting || isCheckingRsvp ? content.rsvp.submitting : content.rsvp.submit}
                </button>
              </form>
            )}
          </motion.div>
        </section>
      </main>
        </>
      )}

      <footer className="site-footer">
        <p>
          {content.footer.credits}
          <span className="site-footer-sep" aria-hidden="true"> · </span>
          <a href="https://alexberrios.com" target="_blank" rel="noopener noreferrer" className="site-footer-link">
            {content.footer.by}
          </a>
        </p>
      </footer>
    </div>
  )
}
