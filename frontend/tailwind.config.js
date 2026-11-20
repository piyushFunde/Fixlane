/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F4F5F2',
        surface: '#FFFFFF',
        ink: '#15211C',
        muted: '#4A5852',
        subtle: '#5B6963',
        border: '#DDE1DC',
        'input-border': '#AEB8B1',
        'column-bg': '#EAEDE8',
        primary: '#0B6E5B',
        'primary-tint': '#E3F1ED',
        'primary-ink': '#0B5A4A',
        danger: '#A52E18',
        'danger-tint': '#FBE4DE',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Bricolage Grotesque', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        input: '10px',
      },
      minHeight: {
        btn: '44px',
        input: '48px',
      },
      maxWidth: {
        page: '1280px',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(26px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-468px 0' },
          '100%': { backgroundPosition: '468px 0' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(.2,.7,.2,1) forwards',
        shimmer: 'shimmer 1.5s infinite linear',
        'pop-in': 'popIn 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
};
