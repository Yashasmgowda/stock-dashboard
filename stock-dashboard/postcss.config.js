export default {
  plugins: {
    '@tailwindcss/postcss': {},  // <--- This is the key fix
    autoprefixer: {},
  },
}
