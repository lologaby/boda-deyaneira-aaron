import './style.css'

// 1. CONFIGURACIÓN
const WEDDING_DATE = new Date('July 18, 2026 17:00:00').getTime();
// ¡¡¡PEGA TU URL DEL SCRIPT AQUÍ!!!
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec'; 

// 2. TRADUCCIONES (Misma lógica, resumida para brevedad)
const translations = {
  es: {
    invite_intro: "Estás invitado a celebrar el amor de",
    rsvp_btn: "Confirmar Asistencia",
    details_title: "Detalles",
    qa_hotel_q: "Hotel",
    qa_hotel_a: "Bloque reservado en Parador Punta Borinquen.",
    qa_airport_q: "Vuelo",
    qa_airport_a: "Aeropuerto Rafael Hernández (BQN).",
    qa_dress_q: "Dress Code",
    qa_dress_a: "Formal Playero",
    rsvp_title: "RSVP",
    rsvp_subtitle: "Por favor responder antes del 1 de Mayo",
    form_name: "Nombre Completo",
    form_attending: "¿Asistirás?",
    option_yes: "Sí, celebraré con ustedes",
    option_no: "Lo siento, no podré ir",
    form_guests: "Invitados Totales",
    form_song: "Canción Recomendada",
    form_submit: "Enviar",
    time_days: "Días", time_hours: "Horas", time_min: "Min"
  },
  en: {
    invite_intro: "You are invited to a celebration of love for",
    rsvp_btn: "RSVP Now",
    details_title: "Details",
    qa_hotel_q: "Hotel",
    qa_hotel_a: "Room block at Parador Punta Borinquen.",
    qa_airport_q: "Flights",
    qa_airport_a: "Rafael Hernández Airport (BQN).",
    qa_dress_q: "Dress Code",
    qa_dress_a: "Beach Formal",
    rsvp_title: "RSVP",
    rsvp_subtitle: "Kindly reply by May 1st",
    form_name: "Full Name",
    form_attending: "Will you attend?",
    option_yes: "Joyfully Accepts",
    option_no: "Regretfully Declines",
    form_guests: "Total Guests",
    form_song: "Song Request",
    form_submit: "Submit",
    time_days: "Days", time_hours: "Hrs", time_min: "Mins"
  }
};

// 3. ANIMACIÓN DE ENTRADA (REVEAL)
window.addEventListener('load', () => {
    const curtain = document.getElementById('reveal-curtain');
    const logo = document.getElementById('reveal-logo');
    
    // 1. Mostrar logo un momento
    setTimeout(() => {
        logo.style.opacity = '0'; // Desvanecer logo
    }, 1000);

    // 2. Abrir telón
    setTimeout(() => {
        curtain.classList.add('reveal-active');
    }, 1500);

    // 3. Eliminar del DOM para poder hacer click abajo
    setTimeout(() => {
        curtain.style.display = 'none';
    }, 4000);
});

// 4. MÚSICA DE FONDO
const musicBtn = document.getElementById('music-btn');
const audio = document.getElementById('bg-music');
let isPlaying = false;

musicBtn.addEventListener('click', () => {
    if(isPlaying) {
        audio.pause();
        musicBtn.classList.remove('animate-spin-slow'); // Opcional: quitar rotación
        musicBtn.style.borderColor = '#4A5D44';
    } else {
        audio.volume = 0.5;
        audio.play();
        isPlaying = true;
        // Feedback visual de que está sonando
        musicBtn.style.backgroundColor = '#4A5D44'; 
        musicBtn.style.color = '#EFEBE0';
    }
    isPlaying = !isPlaying;
});

// 5. COUNTDOWN
setInterval(() => {
    const now = new Date().getTime();
    const distance = WEDDING_DATE - now;

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    document.getElementById('days').innerText = d < 10 ? '0'+d : d;
    document.getElementById('hours').innerText = h < 10 ? '0'+h : h;
    document.getElementById('minutes').innerText = m < 10 ? '0'+m : m;
}, 1000);

// 6. GOOGLE SHEETS SUBMIT
const form = document.getElementById('rsvp-form');
const btnText = document.getElementById('btn-text');
const msg = document.getElementById('form-message');
let currentLang = 'es'; // Variable global simple

form.addEventListener('submit', e => {
    e.preventDefault();
    btnText.innerText = "...";
    
    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: new FormData(form) })
    .then(res => res.json())
    .then(res => {
        if(res.result === 'success') {
            msg.innerText = currentLang === 'es' ? "¡Gracias! Recibido." : "Thank you! Received.";
            msg.classList.remove('hidden');
            form.reset();
        } else {
            throw new Error(res.error);
        }
    })
    .catch(err => {
        console.error(err);
        msg.innerText = "Error. Try again.";
        msg.classList.remove('hidden');
    })
    .finally(() => {
        btnText.innerText = translations[currentLang].form_submit;
    });
});

// 7. CAMBIO DE IDIOMA
document.getElementById('lang-toggle').addEventListener('click', () => {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(translations[currentLang][key]) {
            if(el.tagName === 'INPUT') el.placeholder = translations[currentLang][key];
            else el.innerText = translations[currentLang][key];
        }
    });
});