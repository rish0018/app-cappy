/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("@cappy/ui/tailwind-preset.js")],
  theme: {
    extend: {},
  },
  plugins: [],
};
