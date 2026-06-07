/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        airline: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#38adfa',
          500: '#0f92ec',
          600: '#0275cc', // Main primary blue
          700: '#035da4',
          800: '#075086',
          900: '#0c436f',
        },
        navy: {
          50: '#f4f6fa',
          100: '#e9ecf4',
          200: '#c7cfdf',
          300: '#9db0cb',
          400: '#6d8cb2',
          500: '#466795',
          600: '#38527b',
          700: '#2b3e5e',
          800: '#1c283f',
          950: '#0f172a', // Slate/glassmorphism dark background base
        }
      }
    },
  },
  plugins: [],
}
