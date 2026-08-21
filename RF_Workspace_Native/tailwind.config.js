/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        surface: "#121214",
        surfaceElevated: "#18181b",
        gold: {
          DEFAULT: "#d4af37",
          light: "#e6c35c",
          dark: "#aa8c2c",
          subtle: "rgba(212, 175, 55, 0.12)",
          border: "rgba(212, 175, 55, 0.3)"
        }
      }
    }
  },
  plugins: []
};
