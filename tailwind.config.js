/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'apple': '16px',
        'apple-lg': '20px',
        'apple-xl': '24px',
      },
      colors: {
        apple: {
          bg: 'rgb(var(--color-apple-bg) / <alpha-value>)',
          secondary: 'rgb(var(--color-apple-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--color-apple-tertiary) / <alpha-value>)',
          text: 'rgb(var(--color-apple-text) / <alpha-value>)',
          'text-secondary': 'rgb(var(--color-apple-text-secondary) / <alpha-value>)',
          'text-tertiary': 'rgb(var(--color-apple-text-tertiary) / <alpha-value>)',
          blue: 'rgb(var(--color-apple-blue) / <alpha-value>)',
          green: 'rgb(var(--color-apple-green) / <alpha-value>)',
          red: 'rgb(var(--color-apple-red) / <alpha-value>)',
          black: 'rgb(var(--color-apple-black) / <alpha-value>)',
          separator: 'rgb(var(--color-apple-separator) / <alpha-value>)',
          slate: 'rgb(var(--color-apple-slate) / <alpha-value>)',
        }
      },
      boxShadow: {
        'apple-soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'apple-medium': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'apple-huge': '0 12px 60px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
