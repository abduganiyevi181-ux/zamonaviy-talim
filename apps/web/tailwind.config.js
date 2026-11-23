/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    '../../packages/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F3F9',
          100: '#D9E2F2',
          200: '#B2C4E5',
          300: '#8BA6D7',
          400: '#5479C1',
          500: '#2A52A3',
          600: '#1B3B7E',
          700: '#142C61',
          800: '#0E1E43',
          900: '#0A142D',
          950: '#070E22',
          DEFAULT: '#0A142D', // Deep navy
          deep: '#060D1E',
        },
        royal: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF', // Royal blue
          900: '#1E3A8A',
          DEFAULT: '#1E40AF',
        },
        ivory: {
          50: '#FFFFFF',
          100: '#FBFBFA',
          200: '#F7F6F2', // Soft ivory
          300: '#F0EFE9',
          400: '#E4E2D8',
          500: '#CFCBC0',
          DEFAULT: '#F7F6F2',
        },
        turquoise: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2', // Turquoise accent
          700: '#0E7490',
          800: '#155E75',
          DEFAULT: '#0891B2',
        },
        muted: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#94A3B8',
          400: '#64748B', // High-contrast muted for clear readability
          500: '#475569',
          600: '#334155',
          700: '#1E293B',
          800: '#0F172A',
          900: '#020617',
          DEFAULT: '#475569',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        editorial: [
          'Georgia',
          'Cambria',
          'Times New Roman',
          'serif',
        ],
      },
      boxShadow: {
        'card-subtle': '0 1px 3px 0 rgba(10, 20, 45, 0.05), 0 1px 2px -1px rgba(10, 20, 45, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(10, 20, 45, 0.08), 0 8px 10px -6px rgba(10, 20, 45, 0.04)',
        'modal': '0 25px 50px -12px rgba(10, 20, 45, 0.25)',
        'dropdown': '0 12px 28px -4px rgba(10, 20, 45, 0.12), 0 4px 10px -2px rgba(10, 20, 45, 0.06)',
      },
      borderRadius: {
        'premium': '14px',
        'pill': '9999px',
      },
    },
  },
  plugins: [],
};
