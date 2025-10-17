/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        smiblue: "#1E40AF",
        smiorange: "#F97316",
      },
    },
  },
  plugins: [],
}
