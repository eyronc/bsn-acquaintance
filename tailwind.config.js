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
          pink: '#FFB6D9',      // Soft pastel pink
          lavender: '#E6D4F7',  // Lavender
          sage: '#C8E6D1',      // Sage green
          cream: '#FEF9F3',     // Cream
          plum: '#4A3F5C',      // Deep plum (text)
          gold: '#F4D8A6',      // Gold sparkle
          light: '#FAF5F0',     // Light background
        },
      },
      fontFamily: {
        enchant: ['Poppins', 'Quicksand', 'sans-serif'],
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        float: 'float 3s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { opacity: '0.5' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 182, 217, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 182, 217, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
