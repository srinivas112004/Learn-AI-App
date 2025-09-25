/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' }
        },
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        'pulse-glow': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(255,255,255,0.15)' },
          '50%': { boxShadow: '0 0 0 6px rgba(255,255,255,0)' }
        },
        'bg-pan': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease forwards',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'bg-pan': 'bg-pan 18s linear infinite'
      }
    },
  },
  plugins: [],
}