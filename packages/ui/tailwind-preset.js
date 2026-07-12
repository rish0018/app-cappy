// Shared Tailwind preset consumed by apps/web (Tailwind) and apps/mobile (NativeWind).
// Do not redefine brand colors in app-level tailwind configs   extend this preset instead.
// Values here must stay in sync with ./src/tokens/*.ts (the TS-consumable source of truth).

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef6f5",
          100: "#d7ebe8",
          200: "#b3d8d2",
          300: "#8ab8ae",
          400: "#5fa89c",
          500: "#3e948c",
          600: "#347b74",
          700: "#2b645f",
          800: "#234f4b",
          900: "#1c3f3c",
        },
        tan: {
          50: "#fbf5ee",
          100: "#f3e4d1",
          200: "#e8cca9",
          300: "#d9aa78",
          400: "#c7935c",
          500: "#b17c47",
          600: "#8f6339",
        },
        neutral: {
          0: "#ffffff",
          50: "#faf8f5",
          100: "#f2eee7",
          200: "#e3ddd2",
          300: "#cec1ae",
          400: "#aa9c88",
          500: "#877a68",
          600: "#655c4e",
          700: "#463f36",
          800: "#2b2620",
          900: "#171410",
        },
        info: {
          100: "#dce8f2",
          300: "#7ba7c7",
          500: "#2c5f8a",
          700: "#1f4563",
        },
        accent: {
          100: "#fce3cd",
          300: "#f3ac74",
          500: "#e8823c",
          700: "#b8611f",
        },
        success: {
          100: "#dcefd9",
          500: "#4c9a53",
          700: "#357139",
        },
        warning: {
          100: "#faf0d4",
          500: "#d9a441",
          700: "#a97b26",
        },
        error: {
          100: "#f6dcda",
          500: "#c25b52",
          700: "#953f38",
        },
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
        "4xl": "64px",
      },
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "20px",
        xl: "28px",
      },
      fontFamily: {
        base: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
