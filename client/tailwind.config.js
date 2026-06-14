/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A',
          light: '#3B82F6',
          dark: '#1E293B',
        },
        accent: '#F59E0B',
        success: '#16A34A',
        danger: '#DC2626',
        muted: '#6B7280',
      },
      borderRadius: {
        card: '0.75rem',
      },
    },
  },
  plugins: [],
};
