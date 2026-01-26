import React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useEventState, type EventState } from './hooks/useEventState'
import { DuringWedding } from './components/DuringWedding'
import { AfterWedding } from './components/AfterWedding'

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

const faqIconStyle = { strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const faqIconSvg = (paths: React.ReactNode) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="shrink-0" {...faqIconStyle}>
    {paths}
  </svg>
)

const faqIconPlusOne = faqIconSvg(
  <>
    <circle cx="9" cy="7" r="2.5" />
    <path d="M5 20v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2" />
    <path d="M16 11h4" />
    <path d="M18 9v4" />
  </>
)
const faqIconHotel = faqIconSvg(
  <>
    <path d="M4 21V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12" />
    <path d="M4 13h16" />
    <circle cx="9" cy="9" r="1" fill="currentColor" />
    <circle cx="15" cy="9" r="1" fill="currentColor" />
    <circle cx="9" cy="16" r="1" fill="currentColor" />
    <circle cx="15" cy="16" r="1" fill="currentColor" />
  </>
)
const faqIconPlane = faqIconSvg(
  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
)
const faqIconHeart = faqIconSvg(
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
)
const faqIconDress = faqIconSvg(
  <>
    <path d="M12 2v2" />
    <path d="M8 6h8" />
    <path d="M7 6v12h10V6H7z" />
    <path d="M7 10h10" />
  </>
)

const copy = {
  es: {
    nav: {
      faq: 'Preguntas',
      location: 'Ubicación',
      travel: 'Viaje',
      rsvp: 'Reservación',
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
      rsvpLink: 'Ir a Reservación',
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
          icon: faqIconHeart,
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
      success: '¡Gracias! Recibimos tu reservación.',
      error: 'Hubo un problema. Inténtalo de nuevo.',
      checkSheet: '¡Gracias! Tu respuesta debería estar en la hoja. Si no la ves, inténtalo de nuevo.',
      missingEndpoint: 'Configura el enlace del Google Form para enviar.',
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
      subtitle: 'Gifts & Honeymoon Fund',
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
      noteEn: 'Cash and checks are also lovingly appreciated 🤍',
    },
    music: {
      mute: 'Silenciar música',
      unmute: 'Activar música',
    },
    travel: {
      title: 'Para tu viaje',
      flight: 'Reservar vuelo (NYC → Puerto Rico)',
      flightSkyscanner: 'Comparar precios en Skyscanner',
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
    nav: {
      faq: 'FAQ',
      location: 'Location',
      travel: 'Travel',
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
      rsvpLink: 'Go to RSVP',
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
          icon: faqIconHeart,
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
      checkSheet: 'Thank you! Your response should be in the sheet. If you don’t see it, try again.',
      missingEndpoint: 'Set the Google Form link to submit.',
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
      subtitle: 'Regalos & Luna de Miel',
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
      noteEn: 'Efectivo y cheques también serán recibidos con mucho cariño 🤍',
    },
    music: {
      mute: 'Mute music',
      unmute: 'Unmute music',
    },
    travel: {
      title: 'For your trip',
      flight: 'Book a flight (NYC → Puerto Rico)',
      flightSkyscanner: 'Compare prices on Skyscanner',
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
const flightSearchUrl = 'https://www.google.com/travel/flights?q=Flights%20from%20New%20York%20to%20Puerto%20Rico'
const skyscannerFlightUrl = 'https://www.skyscanner.com/transport/flights/nyca/sjua/'

export default function App() {
  const [lang, setLang] = useState<Language>('es')
  const [countdown, setCountdown] = useState(getCountdown)
  const [showIntro, setShowIntro] = useState(true)
  const [introState, setIntroState] = useState<'closed' | 'opening' | 'revealed'>('closed')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const introCompleted = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rsvpSubmitGuardRef = useRef(false)
  const prefersReducedMotion = useReducedMotion()

  // Detect event state (before, during, after)
  const eventState = useEventState()

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

  useEffect(() => {
    if (introState !== 'revealed') {
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      return
    }
    document.body.style.overflow = ''
    document.body.style.height = ''
    document.body.style.position = ''
    document.body.style.width = ''
  }, [introState])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) setNavOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (showIntro) {
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
    return () => {
      document.body.style.overflow = ''
      document.body.style.height = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [showIntro])

  const handleIntroComplete = () => {
    if (introCompleted.current) return
    introCompleted.current = true
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
      const guestsName = googleFormConfig.guests
      const g = Math.min(2, Math.max(1, parseInt(String(formData.get(guestsName) ?? 1), 10) || 1))
      formData.set(guestsName, String(g))
      await fetch(googleFormConfig.action, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      })
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

  return (
    <div className="min-h-screen bg-boda-cream text-boda-text">
      <Toaster position="top-center" />
      <audio ref={audioRef} src="/audio/tqm.mp3" loop preload="auto" />
      <AnimatePresence>
        {eventState === 'before' && showIntro ? (
          <motion.div
            className="intro-overlay cursor-pointer"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            onClick={handleIntroOpen}
          >
            <div className="intro-bg" aria-hidden="true" />
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

      <nav className="nav-bar" aria-label="Main">
        <div className="nav-inner">
          <button
            type="button"
            className="nav-hamburger sm:hidden"
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
          <div className="hidden sm:flex items-center gap-2">
            <a className="nav-link" href="#faq">
              {content.nav.faq}
            </a>
            <span className="nav-sep" aria-hidden="true">·</span>
            <a className="nav-link" href="#location">
              {content.nav.location}
            </a>
            <span className="nav-sep" aria-hidden="true">·</span>
            <a className="nav-link" href="#travel">
              {content.nav.travel}
            </a>
          </div>
          <a href="#rsvp" className="nav-rsvp-btn hidden sm:inline-flex">
            {content.nav.rsvp}
          </a>
          <button type="button" className="nav-lang-btn" onClick={toggleLanguage} aria-label="Toggle language">
            {content.nav.toggle}
          </button>
        </div>
        {navOpen && (
          <>
            <div className="nav-overlay sm:hidden" onClick={() => setNavOpen(false)} aria-hidden />
            <div className="nav-mobile-menu sm:hidden">
              <a href="#faq" className="nav-mobile-link" onClick={() => setNavOpen(false)}>{content.nav.faq}</a>
              <a href="#location" className="nav-mobile-link" onClick={() => setNavOpen(false)}>{content.nav.location}</a>
              <a href="#travel" className="nav-mobile-link" onClick={() => setNavOpen(false)}>{content.nav.travel}</a>
              <a href="#rsvp" className="nav-mobile-link nav-mobile-link-rsvp" onClick={() => setNavOpen(false)}>{content.nav.rsvp}</a>
            </div>
          </>
        )}
      </nav>

      {/* DURING STATE: Live celebration message */}
      {eventState === 'during' && (
        <DuringWedding content={content.during} />
      )}

      {/* AFTER STATE: Thank you message */}
      {eventState === 'after' && (
        <AfterWedding content={content.after} />
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
        <section id="faq" className="faq-section">
          <img src="/images/hibiscus.png" alt="" className="faq-flower faq-flower-left" />
          <img src="/images/bird_of_paradise.png" alt="" className="faq-flower faq-flower-right" />
          <motion.div {...revealMotion} className="section-inner">
            <div className="details-banner">
              <span className="details-text">{content.details}</span>
            </div>
            <div className="section-heading">
              <h2 className="section-title">{content.faq.title}</h2>
            </div>
            <div className="faq-rsvp-row">
              <a href="#rsvp" className="faq-rsvp-link">
                {content.faq.rsvpLink}
              </a>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {content.faq.items.map(item => (
                <details key={item.key} className="faq-details">
                  <summary className="faq-summary">
                    <span className="faq-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <h3 className="faq-title">{item.question}</h3>
                    <span className="faq-chevron" aria-hidden="true" />
                  </summary>
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
                </details>
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

        <section id="gifts" className="gifts-section">
          <motion.div {...revealMotion} className="section-inner">
            <div className="gifts-icon" aria-hidden="true">
              ♡
            </div>
            <div className="gifts-heading">
              <h2>{content.gifts.title}</h2>
              <p>{content.gifts.subtitle}</p>
            </div>
            <div className="gifts-copy">
              {content.gifts.paragraphs.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="gifts-box" role="list">
              <div className="gifts-line" role="listitem">
                <span>{content.gifts.payment.ath}:</span>
                <strong>787-516-1189</strong>
              </div>
              <div className="gifts-line" role="listitem">
                <span>{content.gifts.payment.venmo}:</span>
                <strong>@akfy910</strong>
              </div>
              <div className="gifts-line" role="listitem">
                <span>{content.gifts.payment.zelle}:</span>
                <strong>516-216-0869</strong>
              </div>
            </div>
            <p className="gifts-note">{content.gifts.note}</p>
            <p className="gifts-note-alt">{content.gifts.noteEn}</p>
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
              <a
                href={skyscannerFlightUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="travel-btn travel-btn-places"
              >
                {planeIcon}
                <span>{content.travel.flightSkyscanner}</span>
              </a>
              <details className="travel-details">
                <summary className="travel-btn travel-btn-places">
                  {mapPinIcon}
                  <span>{content.travel.places}</span>
                  <span className="travel-chevron" aria-hidden="true" />
                </summary>
                <div className="travel-places-inner">
                  <p className="travel-subsection">{content.travel.restaurantsLabel}</p>
                  <ul className="travel-restaurants-list" aria-label={content.travel.restaurantsLabel}>
                    {content.travel.restaurants.map(r => {
                      const mealLabel = content.travel[({ breakfast: 'mealBreakfast', lunch: 'mealLunch', dinner: 'mealDinner', desserts: 'mealDesserts', cafe: 'mealCafe' } as const)[r.meal]]
                      return (
                        <li key={r.name}>
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="travel-restaurant-pill"
                            title={mealLabel + ': ' + r.name}
                          >
                            <span className="travel-restaurant-icon" aria-hidden="true">{MEAL_ICONS[r.meal]}</span>
                            <span className="travel-restaurant-meal">{mealLabel}</span>
                            <span className="travel-restaurant-sep" aria-hidden="true">·</span>
                            <span>{r.name}</span>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                  <p className="travel-subsection">{content.travel.beachesLabel}</p>
                  <ul className="travel-beaches-grid">
                    {content.travel.beaches.map(place => (
                      <li key={place.name}>
                        <a
                          href={place.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="travel-place-btn"
                        >
                          {place.name}
                        </a>
                      </li>
                    ))}
                  </ul>
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
                  max={2}
                  step={1}
                  inputMode="numeric"
                  defaultValue={1}
                  required
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault()
                  }}
                  onInput={(e) => {
                    const n = parseInt(e.currentTarget.value, 10)
                    if (!Number.isNaN(n) && (n < 1 || n > 2)) {
                      e.currentTarget.value = String(Math.min(2, Math.max(1, n)))
                    }
                  }}
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
              {!googleFormConfig && (
                <p className="text-center text-xs text-boda-sage/70">{content.rsvp.missingEndpoint}</p>
              )}
            </form>
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
