/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Formal serif for headings — evokes official documents & plaques
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // "UN blue" institutional scale — primary brand color
        un: {
          50: '#EEF5FC',
          100: '#D7E8F7',
          200: '#AFD0EF',
          300: '#7FB3E4',
          400: '#4C93D6',
          500: '#2874B8',
          600: '#1D5C97',
          700: '#164876',
          800: '#0F3355',
          900: '#0A2038',
        },
        // Gold/bronze accent — laurel, seals, dividers
        gold: {
          50: '#FBF6EA',
          100: '#F3E6C2',
          200: '#E6CD8C',
          300: '#D4AF5F',
          400: '#C39A3F',
          500: '#B08D2E',
          600: '#8F7124',
          700: '#6E571C',
        },
        // Warm off-white — the "document paper" canvas
        paper: {
          DEFAULT: '#FAF8F3',
          dim: '#F2EEE3',
        },
      },
      boxShadow: {
        plaque: '0 1px 2px rgba(15, 51, 85, 0.06), 0 4px 16px rgba(15, 51, 85, 0.06)',
      },
    },
  },
  plugins: [],
};
