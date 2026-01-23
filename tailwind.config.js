/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{html,js,ts,jsx,tsx}", 
    "src/**/*.{html,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['"Playfair Display"', 'serif'],
        'sans': ['"Montserrat"', 'sans-serif'],
      },
      colors: {
        // AQUÍ ES DONDE SE DEFINEN TUS COLORES NUEVOS
        boda: {
          olive: '#4A5D44',
          wine: '#5D2A32',
          terracotta: '#A96B48',
          sand: '#EFEBE0',    // <--- ESTE ES EL QUE TE FALTA O NO LEE
          gold: '#C5A065',
          dark: '#1C1C1C',
        }
      },
      backgroundImage: {
        'paper-texture': "url('images/paper-noise.png')",
      }
    },
  },
  plugins: [],
}