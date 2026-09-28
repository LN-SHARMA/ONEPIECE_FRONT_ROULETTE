/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pirate: ['"Pirata One"', 'cursive', 'serif'],
        cinzel: ['"Cinzel Decorative"', 'serif'],
        heading: ['"Outfit"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      colors: {
        parchment: {
          light: '#fdf6e2',
          DEFAULT: '#f4ecd8',
          dark: '#e2d5b5',
          aged: '#c8b693',
        },
        ocean: {
          deep: '#030d1a',
          abyss: '#020617',
          wave: '#0ea5e9',
          crest: '#38bdf8',
        },
        haki: {
          observation: '#06b6d4',
          armament: '#64748b',
          armamentDark: '#0f172a',
          conqueror: '#dc2626',
          conquerorDark: '#450a0a',
        },
        berry: '#f59e0b',
      },
      boxShadow: {
        'haki-obs': '0 0 20px rgba(6, 182, 212, 0.45)',
        'haki-arm': '0 0 20px rgba(100, 116, 139, 0.6), inset 0 0 10px rgba(15, 23, 42, 0.8)',
        'haki-conq': '0 0 30px rgba(220, 38, 38, 0.65), 0 0 10px rgba(239, 68, 68, 0.9)',
        'poster': '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'haki-wave': 'hakiWave 3s ease-out infinite',
        'lightning': 'lightningFlash 4s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        hakiWave: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        lightningFlash: {
          '0%, 93%, 98%, 100%': { opacity: '0' },
          '94%, 96%': { opacity: '0.85' },
        }
      }
    },
  },
  plugins: [],
}
