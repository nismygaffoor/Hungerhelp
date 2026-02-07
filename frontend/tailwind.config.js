/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#16a34a", // Green-600
        secondary: "#ca8a04", // Yellow-600
        dark: "#1f2937",
        light: "#f3f4f6"
      }
    },
  },
  plugins: [],
}
