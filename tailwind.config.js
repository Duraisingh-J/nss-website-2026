/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#163B66",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#C23B3B",
          foreground: "#FFFFFF",
        },
        background: "#F7F6F2",
        surface: "#FFFFFF",
        foreground: "#17202A",
        muted: "#667085",
        border: "#E2E8F0",
        heritage: "#C99A4B",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
}
