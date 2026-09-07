/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
        foreground: "#0F172A",
        muted: {
          DEFAULT: "#64748B",
          dark: "#94A3B8",
        },
        border: "#E2E8F0",
        primary: {
          DEFAULT: "#174A7E",
          foreground: "#FFFFFF",
          dark: "#0F172A",
        },
        accent: {
          DEFAULT: "#D94B4B",
          foreground: "#FFFFFF",
          hover: "#C53B3B",
          subtle: "#FEF2F2",
        },
        ink: {
          DEFAULT: "#0F172A",
          surface: "#1E293B",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
}

