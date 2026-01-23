/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "src/**/*.{js,ts,jsx,tsx}" // Ruta redundante por seguridad
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['"Playfair Display"', 'serif'],
        'sans': ['"Montserrat"', 'sans-serif'],
      },
      colors: {
        boda: {
          olive: '#4A5D44',
          wine: '#5D2A32',
          terracotta: '#A96B48',
          sand: '#EFEBE0',
          gold: '#C5A065',
          dark: '#1C1C1C',
        }
      },
      backgroundImage: {
        // SIN BARRA INICIAL
        'paper-texture': "url('images/paper-noise.png')",
      }
    },
  },
  plugins: [],
}