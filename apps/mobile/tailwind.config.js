/** @type {import('tailwindcss').Config} */
module.exports = {
  // Cappy ships one unified light theme   never switch based on OS/system
  // dark-mode preference.
  darkMode: false,
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("@cappy/ui/tailwind-preset.js")],
  theme: {
    extend: {},
  },
  plugins: [],
};
