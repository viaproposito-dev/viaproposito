import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'stix-italic': ['STIX Two Text', 'serif'],
      },
      colors: {
        // Colores primarios de Vía Propósito
        'via-primary': '#295244',        // Verde principal
        'via-secondary': '#586E26',      // Verde secundario  
        'via-light': '#96AC61',          // Verde claro
        'via-sage': '#A3B7AD',           // Azul verdoso
        'via-dark': '#343D24',           // Verde oscuro
        'via-cream': '#FEFBEF',          // Crema
        'via-yellow': '#EAC534',         // Amarillo
        'via-orange': '#CC6F48',         // Naranja
      },
    },
  },
  plugins: [],
}

export default config