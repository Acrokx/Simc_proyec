/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Tonos azules para el proyecto SIMC
const tintColorLight = '#2563eb'; // Azul principal
const tintColorDark = '#93c5fd'; // Azul claro

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Colores personalizados
    primary: '#2563eb',      // Azul principal
    primaryDark: '#1d4ed8',  // Azul oscuro
    primaryLight: '#3b82f6', // Azul claro
    secondary: '#0ea5e9',    // Cyan azulado
    accent: '#06b6d4',      // Cyan
    success: '#22c55e',     // Verde success
    warning: '#f59e0b',     // Naranja warning
    error: '#ef4444',       // Rojo error
    card: '#ffffff',
    border: '#e5e7eb',
    textSecondary: '#6b7280',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    primaryLight: '#60a5fa',
    secondary: '#38bdf8',
    accent: '#22d3ee',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    card: '#1f2937',
    border: '#374151',
    textSecondary: '#9ca3af',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
