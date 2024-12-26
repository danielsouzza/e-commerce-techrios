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
        primary: '#00579d',
        secondary: '#3dccfd',
        p:'#535353',
      }
    },
  },
  plugins: [],
}

