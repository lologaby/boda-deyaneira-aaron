/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Playfair Display"', 'serif'],
        'heading': ['"Montserrat"', 'sans-serif'],
        'sans': ['"Inter"', 'sans-serif'],
      },
      colors: {
        boda: {
          cream: '#E8E0D6',
          terracotta: '#E89C7C',
          coral: '#FF6B6B',
          orange: '#FF8C42',
          forest: '#1A4D2E',
          sage: '#5A756E',
          sageDark: '#455a54',
          lime: '#C1D82F',
          burgundy: '#8B4B5C',
          gold: '#D4AF37',
          teal: '#2C7873',
          purple: '#4A1A4A',
          beige: '#C9A687',
          sky: '#BFD9EA',
          black: '#0F0F0F',
          text: '#2C2C2C',
          light: '#FFFFFF',
        }
      },
      backgroundImage: {
        'film-grain-texture': "url('/images/film-grain.svg')",
        'sunset-gradient': "linear-gradient(180deg, #F9E0D2 0%, #E89C7C 60%, #FF8C42 100%)",
        'paper-texture': "url('/images/paper-noise.png')",
      }
    },
  },
  plugins: [],
}
