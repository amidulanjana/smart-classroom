/**
 * SchoolConnect App Theme
 */

import { Platform } from "react-native";

export const Colors = {
  light: {
    primary: "#2463eb",
    primaryDark: "#1d4ed8",
    background: "#f6f6f8",
    surface: "#ffffff",
    text: "#0e121b",
    textSecondary: "#64748b",
    border: "#e5e7eb",
    error: "#ef4444",
    // Accent colors
    blue: "#2463eb",
    blueLight: "#DBEAFE",
    orange: "#EA580C",
    orangeLight: "#FED7AA",
    green: "#10B981",
    greenLight: "#D1FAE5",
    red: "#EA4335",
    white: "#ffffff",
    black: "#000000",
    shadow: "#000000",
  },
  dark: {
    primary: "#2463eb",
    primaryDark: "#1d4ed8",
    background: "#111621",
    surface: "#1f2937",
    text: "#ffffff",
    textSecondary: "#9ca3af",
    border: "#374151",
    error: "#ef4444",
    // Accent colors
    blue: "#2463eb",
    blueLight: "#1e40af",
    orange: "#EA580C",
    orangeLight: "#7c2d12",
    green: "#10B981",
    greenLight: "#064e3b",
    red: "#EA4335",
    white: "#ffffff",
    black: "#000000",
    shadow: "#000000",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
