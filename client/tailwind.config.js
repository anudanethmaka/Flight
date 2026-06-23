/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces
        base: '#070B14',
        surface: '#0B1120',
        'surface-2': '#0F172A',
        'surface-3': '#1E293B',
        // Text
        foreground: '#E2E8F0',
        muted: '#94A3B8',
        // Brand
        primary: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#1E3A8A',
        },
        accent: {
          DEFAULT: '#2DD4BF',
          dark: '#14B8A6',
        },
        success: '#22C55E',
        danger: '#F43F5E',
        warning: '#F59E0B',
      },
      borderRadius: {
        card: '1rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(45,212,191,0.18), 0 0 24px -6px rgba(59,130,246,0.45)',
        'glow-teal': '0 0 24px -4px rgba(45,212,191,0.5)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(45,212,191,0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(45,212,191,0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        scaleUp: 'scaleUp 0.25s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
