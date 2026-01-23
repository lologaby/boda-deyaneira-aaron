import './style.css'

// --- CONFIGURACIÓN ---
const WEDDING_DATE = new Date('July 18, 2026 17:00:00').getTime();
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec'; 

// --- TRADUCCIONES ---
const translations = {
  es: {
    header_subtitle: "TE INVITAMOS A CELEBRAR NUESTRO AMOR BAJO EL ATARDECER",
    faq_title: "Preguntas Frecuentes",
    faq_q_plusone: "¿Puedo traer un invitado (+1)?",
    faq_a_plusone: "Nos encantaría celebrar con todos, sin embargo, solo los invitados con un +1 incluido podrán traer acompañante. Si su invitación lo incluye, lo verá claramente indicado.",
    faq_q_airport: "¿Qué aeropuerto debo utilizar para llegar?",
    faq_a_airport: "Puerto Rico es una isla accesible y fácil de recorrer. No obstante, si planea hospedarse en el área oeste, le recomendamos llegar al Aeropuerto Rafael Hernández (BQN) en Aguadilla, el más cercano a nuestra celebración.",
    faq_q_hotel: "¿Hay un bloque de hotel reservado?",
    faq_a_hotel: "Sí. Hemos reservado un bloque de habitaciones en Parador Punta Borinquen, Aguadilla, PR 00603. Para recibir la tarifa con descuento, puede utilizar la boda como referencia al momento de hacer su reservación.",
    faq_q_children: "¿Pueden asistir niños?",
    faq_a_children: "Amamos a todos los peques, pero hemos decidido que nuestra ceremonia y recepción serán solo para adultos. Los invitamos a aprovechar esta ocasión como un 'date night' ✨",
    faq_q_dresscode: "¿Cuál es el código de vestimenta?",
    faq_a_dresscode_1: "El código de vestimenta es formal playero.",
    faq_a_dresscode_2: "– No pantalones cortos, – No sandalias para hombres",
    faq_a_dresscode_3: "Adjuntamos una paleta de colores como referencia para su atuendo.",
    map_directions_btn: "Cómo llegar",
    form_name: "Nombre Completo",
    form_attending: "¿Asistirás?",
    option_yes: "Sí, celebraré con ustedes",
    option_no: "Lo siento, no podré ir",
    form_guests: "Invitados Totales",
    form_song: "Canción para bailar",
    form_submit: "Enviar",
    time_days: "Días", time_hours: "Horas", time_min: "Min", time_secs: "Seg",
  },
  en: {
    header_subtitle: "WE INVITE YOU TO CELEBRATE OUR LOVE UNDER THE SUNSET",
    faq_title: "Frequently Asked Questions",
    faq_q_plusone: "Can I bring a guest (+1)?",
    faq_a_plusone: "We would love to celebrate with everyone; however, only guests with a +1 indicated on their invitation may bring an additional guest. If your invitation includes one, it will be clearly noted.",
    faq_q_airport: "Which airport should I use when traveling to Puerto Rico?",
    faq_a_airport: "Puerto Rico is easy to navigate and accessible from anywhere on the island. That said, if you plan to stay in the western area, we recommend flying into Rafael Hernández Airport (BQN) in Aguadilla, the closest airport to our wedding venue.",
    faq_q_hotel: "Is there a hotel room block available?",
    faq_a_hotel: "Yes! A room block has been reserved at Parador Punta Borinquen, Aguadilla, PR 00603. Please mention the wedding when booking to receive the discounted rate.",
    faq_q_children: "Are children allowed to attend?",
    faq_a_children: "While we love all little ones, we have decided to make our ceremony and reception adults-only. We encourage you to enjoy this evening as a special date night ✨",
    faq_q_dresscode: "What is the dress code?",
    faq_a_dresscode_1: "The dress code is Beach Formal.",
    faq_a_dresscode_2: "– No shorts, – No sandals for men",
    faq_a_dresscode_3: "We have included a color palette for outfit inspiration.",
    map_directions_btn: "Get Directions",
    form_name: "Full Name",
    form_attending: "Will you attend?",
    option_yes: "Joyfully Accepts",
    option_no: "Regretfully Declines",
    form_guests: "Total Guests",
    form_song: "Song Request",
    form_submit: "Submit",
    time_days: "Days", time_hours: "Hrs", time_min: "Mins", time_secs: "Secs",
  }
};

// --- LÓGICA PRINCIPAL ---

// Animación de entrada
window.addEventListener('load', () => {
    const curtain = document.getElementById('reveal-curtain');
    
    setTimeout(() => {
        curtain.classList.add('reveal-active');
    }, 500);

    setTimeout(() => {
        curtain.style.display = 'none';
    }, 3500);
});

// Lógica del botón de música
const musicBtn = document.getElementById('music-btn');
const audio = document.getElementById('bg-music');
let isPlaying = false;

musicBtn.addEventListener('click', () => {
    if(isPlaying) {
        audio.pause();
        musicBtn.classList.remove('playing');
    } else {
        audio.volume = 0.5;
        audio.play();
        musicBtn.classList.add('playing');
    }
    isPlaying = !isPlaying;
});

// Lógica del Contador Regresivo
setInterval(() => {
    const now = new Date().getTime();
    const distance = WEDDING_DATE - now;

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = d < 10 ? '0'+d : d;
    document.getElementById('hours').innerText = h < 10 ? '0'+h : h;
    document.getElementById('minutes').innerText = m < 10 ? '0'+m : m;
    document.getElementById('seconds').innerText = s < 10 ? '0'+s : s;
}, 1000);

// Envío del formulario RSVP
const form = document.getElementById('rsvp-form');
const btnText = document.getElementById('btn-text');
const msg = document.getElementById('form-message');
let currentLang = 'es';

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

// Lógica del cambio de idioma
function updateTexts(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(translations[lang][key]) {
            if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = translations[lang][key];
            else el.innerText = translations[lang][key];
        }
    });
}

document.getElementById('lang-toggle').addEventListener('click', () => {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    updateTexts(currentLang);
});

// Inicializar textos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  updateTexts(currentLang);
});