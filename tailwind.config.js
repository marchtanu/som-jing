/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF8F5',
        paper: '#FFFFFF',
        sand: '#F3EFE8',
        stoneBorder: '#E6E1D6',
        ink: '#141413',
        mutedInk: '#57534E',
        vermilion: {
          DEFAULT: '#D94E28',
          hover: '#BF3F1C',
          soft: '#FFF1EC',
        },
        emeraldSeal: {
          DEFAULT: '#0D7A5F',
          soft: '#ECFDF5',
        },
        escrowBlue: {
          DEFAULT: '#1D4ED8',
          soft: '#EFF6FF',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans Thai"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20, 20, 19, 0.04), 0 4px 16px rgba(20, 20, 19, 0.04)',
        elevated: '0 8px 30px rgba(20, 20, 19, 0.08)',
      },
    },
  },
  plugins: [],
};
