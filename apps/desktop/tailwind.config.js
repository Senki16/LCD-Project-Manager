/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'SF Pro Text', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['-apple-system', 'SF Pro Display', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        apple: {
          blue: '#007AFF',
          'blue-dark': '#0A84FF',
          green: '#34C759',
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          purple: '#AF52DE',
          pink: '#FF2D55',
          teal: '#5AC8FA',
        },
        light: {
          bg: '#FFFFFF',
          'bg-secondary': '#F5F5F7',
          'bg-tertiary': '#EBEBF0',
          border: '#E5E5EA',
          'text-primary': '#1C1C1E',
          'text-secondary': '#6E6E73',
          'text-tertiary': '#AEAEB2',
        },
        dark: {
          bg: '#000000',
          'bg-secondary': '#1C1C1E',
          'bg-tertiary': '#2C2C2E',
          border: '#38383A',
          'text-primary': '#FFFFFF',
          'text-secondary': '#AEAEB2',
          'text-tertiary': '#636366',
        },
      },
      borderRadius: {
        apple: '12px',
        'apple-lg': '18px',
        'apple-xl': '24px',
      },
      boxShadow: {
        apple: '0 2px 8px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.06)',
        'apple-md': '0 4px 16px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.08)',
        'apple-lg': '0 8px 32px rgba(0, 0, 0, 0.16), 0 0 1px rgba(0, 0, 0, 0.06)',
        'apple-dark': '0 2px 8px rgba(0, 0, 0, 0.4), 0 0 1px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in': 'slideIn 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { transform: 'translateY(16px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        slideIn: { from: { transform: 'translateX(-16px)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        scaleIn: { from: { transform: 'scale(0.92)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
      },
    },
  },
  plugins: [],
};
