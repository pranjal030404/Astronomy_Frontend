/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Astronomy-themed dark color palette
        'space': {
          900: '#0a0e27', // Deep space black
          800: '#0f1428', // Dark space
          700: '#1a1f3a', // Midnight blue
          600: '#252b4a', // Deep blue
          500: '#2f3659', // Space blue
          400: '#3d4568', // Medium blue
          300: '#4d5578', // Light blue
          200: '#6b7496', // Pale blue
          100: '#9096b0', // Very pale blue
        },
        'star': {
          900: '#ffd700', // Gold
          800: '#ffe066', // Bright star
          700: '#ffeb99', // Pale star
          600: '#fff4cc', // Very pale star
        },
        'nebula': {
          purple: '#8b5cf6', // Purple nebula
          pink: '#ec4899',   // Pink nebula
          blue: '#3b82f6',   // Blue nebula
          teal: '#14b8a6',   // Teal nebula
        },
        'cosmos': {
          dark: '#000000',
          darker: '#050510',
          light: '#ffffff',
        },
      },
      backgroundImage: {
        'starfield': "url('/starfield.jpg')",
        'nebula-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'galaxy-gradient': 'linear-gradient(to right, #434343 0%, black 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 1)' },
        },
      },
    },
  },
  plugins: [],
}
