/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1D4ED8', light: '#EFF6FF', dark: '#1E40AF' },
        secondary: '#475569',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        info: '#0891B2',
      },
      keyframes: {
        'highlight-fade': {
          '0%': { backgroundColor: '#FEF3C7' },
          '100%': { backgroundColor: 'transparent' },
        },
        'count-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'bell-bounce': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(15deg)' },
          '50%': { transform: 'rotate(-10deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
      },
      animation: {
        'highlight-fade': 'highlight-fade 1.5s ease-out forwards',
        'count-pulse': 'count-pulse 0.4s ease-in-out',
        'bell-bounce': 'bell-bounce 0.5s ease-in-out',
      },
      borderRadius: {
        'ds': '6px',
      },
    },
  },
  plugins: [],
};
