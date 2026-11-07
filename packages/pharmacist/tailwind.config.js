/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f9ff',
          100: '#e6f0ff',
          200: '#c1d8ff',
          300: '#9bbfff',
          400: '#5c96ff',
          500: '#2f74ff',
          600: '#1657e6',
          700: '#1245b4',
          800: '#0f358a',
          900: '#0b2663',
        },
      },
    },
  },
  plugins: [],
}
