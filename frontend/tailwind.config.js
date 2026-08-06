/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        enchant: {
          pink: '#ec4899',      // Hot vibrant pink
          rose: '#f43f5e',      // Rose accent
          lavender: '#d946ef',  // Radiant purple/lavender
          sage: '#10b981',      // Emerald green (selected seat)
          cream: '#FEF2F6',     // Soft blush cream
          plum: '#1e293b',      // Deep slate text
          gold: '#f59e0b',      // Warm gold accent
          light: '#FFF5F8',     // Light background tint
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        enchant: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'pink-soft': '0 10px 25px -5px rgba(236, 72, 153, 0.15), 0 8px 10px -6px rgba(236, 72, 153, 0.1)',
        'pink-glow': '0 0 20px rgba(236, 72, 153, 0.35)',
        'neu-card': '10px 10px 25px rgba(236, 72, 153, 0.08), -10px -10px 25px rgba(255, 255, 255, 0.95)',
        'neu-pressed': 'inset 3px 3px 6px rgba(219, 112, 147, 0.15), inset -3px -3px 6px #ffffff',
      },
    },
  },
  plugins: [],
}
