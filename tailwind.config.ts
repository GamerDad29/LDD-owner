import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        duck: {
          50: '#f0f7ff',
          100: '#dfeeff',
          200: '#b8ddff',
          300: '#79c2ff',
          400: '#36a3ff',
          500: '#0b82f0',
          600: '#0066cc',
          700: '#0051a5',
          800: '#054588',
          900: '#0a3a70',
          950: '#07254a',
        },
        gold: {
          50: '#fffceb',
          100: '#fff5c6',
          200: '#ffea88',
          300: '#ffd94a',
          400: '#ffc520',
          500: '#f0a500',
          600: '#cc7d00',
          700: '#a25802',
          800: '#86440a',
          900: '#72380c',
        },
        slate: {
          925: '#0c1222',
          950: '#070d1a',
        }
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
        'count-up': 'count-up 0.3s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
