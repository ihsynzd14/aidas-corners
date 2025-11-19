/**
 * Color Scheme for Aidas Corners
 * Centralized color constants matching the HTML design
 */

export const colorScheme = {
  primary: '#D9A6A3',
  backgroundLight: '#FDF7F3',
  backgroundDark: '#2C2A29',
  cardLight: '#FFFBF8',
  cardDark: '#3D3A38',
  textLight: '#4F4544',
  textDark: '#EAE3DD',
  textSubtleLight: '#897E7C',
  textSubtleDark: '#A89F9A',
  accentGreen: '#5D9C59',
  borderRed: '#fccdc593',
  lightRed: '#fccdc541',
  accentRed: '#DF6751',
  accentBlue: '#6B9080',
  white: '#FFFFFF',
  black: '#000000',

  primaryRed: '#ee2b4b',
  backgroundLightHtml: '#f8f6f6',
  backgroundDarkHtml: '#221013',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
} as const;

export type ColorScheme = typeof colorScheme;

