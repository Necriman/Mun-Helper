/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Formal serif for headings — evokes official documents & plaques
        serif: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // "UN blue" institutional scale — primary brand color
        un: {
          50: '#EAF5FD',
          100: '#D4EBFA',
          200: '#A9D6F5',
          300: '#7FC2EF',
          400: '#5B92E5',
          500: '#009EDB',
          600: '#007DB1',
          700: '#005F8A',
          800: '#0B3A5B',
          900: '#0B1F3A',
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
