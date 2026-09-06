/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        monastic: {
          gold: '#c5a059',
          amber: '#d97706',
          ivory: '#faf8f2',
          warm: '#fdfbf7',
          surface: '#ffffff',
          border: '#e8e2d4',
          sand: '#f5efe0',
          dark: '#1e293b',
        },
        accent: {
          pink: '#db2777',
          pinklight: '#fdf2f8',
          pinkborder: '#fbcfe8',
          gray: '#475569',
          graylight: '#f8fafc',
          grayborder: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Sarabun', 'Prompt', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
