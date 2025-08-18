// Color palette for the application
export const colors = {
  // Main colors
  main: "#FFAD94",
  primary: "#FFAD94",

  // Secondary colors
  secondary: "#FFD1CC",
  accent: "#FFD8C8",

  // Accent palette
  accent1: "#FFD1CC",
  accent2: "#FFD8C8",
  accent3: "#FFEDBF",
  accent4: "#FFF9B9",

  // Brand color scale
  brand: {
    50: "#FFF9B9",
    100: "#FFEDBF",
    200: "#FFD8C8",
    300: "#FFD1CC",
    400: "#FFAD94",
    500: "#FFAD94",
    600: "#FFAD94",
    700: "#FF9D82",
    800: "#E07E63",
    900: "#B95F49",
    950: "#6B3426",
    DEFAULT: "#FFAD94",
  },

  // Text colors
  heading: "#403C4E",
  body: "#403C4E",
} as const;

// Type for color names (excluding nested objects)
export type ColorName = keyof Omit<typeof colors, "brand">;

// Utility function to get color value
export function getColor(colorName: ColorName): string {
  return colors[colorName] as string;
}

// CSS custom properties for use in styled-components or inline styles
export const cssColors = {
  "--color-main": colors.main,
  "--color-primary": colors.primary,
  "--color-secondary": colors.secondary,
  "--color-accent": colors.accent,
  "--color-accent1": colors.accent1,
  "--color-accent2": colors.accent2,
  "--color-accent3": colors.accent3,
  "--color-accent4": colors.accent4,
} as const;
