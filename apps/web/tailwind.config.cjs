/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@cappy/ui/tailwind-preset.js")],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
