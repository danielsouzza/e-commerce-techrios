/** @type {import('tailwindcss').Config} */
export default {
  prefix:'tw-',
  content: [
    './src/pages/**/*.vue',
    './src/components/**/*.vue',
    './src/layouts/**/*.vue',
    './src/layouts/*.vue',
    "./src/*.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        p:'#535353',
      }
    },
  },
  plugins: [],
}

