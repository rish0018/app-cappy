/** @type {import('tailwindcss').Config} */
module.exports = {
  // Cappy ships one unified light theme   never switch based on OS/browser
  // dark-mode preference (see Card.tsx's now-removed `feature` dark: variant,
  // which was rendering near-black in dark mode unintentionally).
  darkMode: false,
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
