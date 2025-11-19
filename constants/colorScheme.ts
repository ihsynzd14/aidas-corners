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
  accentRed: '#DF6751',
  accentBlue: '#6B9080',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorScheme = typeof colorScheme;

