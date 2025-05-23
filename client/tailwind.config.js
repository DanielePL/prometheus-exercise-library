/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'prometheus-orange': '#ff6600',
        'prometheus-dark': '#1a1a1a',
      }
    },
  },
  plugins: [],
}