/** Typography scale — calm, readable, generous line-height for accessibility. */
export const typography = {
  fontFamily: {
    base: "Inter, system-ui, sans-serif",
    display: "Poppins, Inter, system-ui, sans-serif",
  },
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

export type TypographyToken = typeof typography;
