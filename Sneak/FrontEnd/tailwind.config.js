export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/public/**/*.{js,jsx,ts,tsx}",
    "./src/private/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'grotesk': ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        'sneakhead': {
          'black': '#0A0A0A',
          'gray': '#1A1A1A',
          'light-gray': '#2A2A2A',
          'red': '#DC2626',
          'red-light': '#EF4444',
          'red-dark': '#B91C1C',
        },
        'red': {
          '500': '#EF4444',
          '600': '#DC2626',
          '700': '#B91C1C',
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        glow: {
          'from': { boxShadow: '0 0 20px #DC2626' },
          'to': { boxShadow: '0 0 30px #DC2626, 0 0 40px #DC2626' }
        },
        slideUp: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
