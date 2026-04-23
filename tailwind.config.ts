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
        cyan: {
          50:  '#ecfbfd',
          100: '#d2f5fa',
          200: '#a8ecf4',
          300: '#70dde9',
          400: '#40c8dc',
          500: '#1fadc2',
          600: '#158ba0',
          700: '#136e80',
          800: '#125969',
          900: '#0f4957',
          950: '#082c37',
        },
        orange: {
          50:  '#fff6ec',
          100: '#ffe8ce',
          200: '#ffcd9c',
          300: '#ffae63',
          400: '#ff9a3c',
          500: '#f5791a',
          600: '#d85b12',
          700: '#af4212',
          800: '#8c3516',
          900: '#712d15',
          950: '#3d1508',
        },
        slate: {
          925: '#0c1222',
          950: '#070d1a',
        },
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
