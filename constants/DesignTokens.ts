/**
 * Design Tokens for Aida's Corner
 * Centralized design system management
 */

import { TextStyle, ViewStyle } from 'react-native';

// Typography Scale
export const Typography = {
  displayLarge: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  headingLarge: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.25,
  },
  headingMedium: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  headingSmall: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.25,
  },
} as const;

// Spacing System (8dp grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Border Radius
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 24,
  full: 9999,
} as const;

// Shadow System
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// Animation Durations
export const Animation = {
  fast: 100,
  normal: 150,
  slow: 300,
} as const;

// Component-specific tokens
export const ComponentTokens = {
  // Menu Container
  menuCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    minHeight: 100,
    shadow: Shadows.md,
  },
  // Primary Menu Cards (larger)
  primaryMenuCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    minHeight: 120,
    shadow: Shadows.md,
  },
  // Top Bar
  topBar: {
    height: 56,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  // Touch Targets
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
  },
} as const;

// Breakpoints for responsive design
export const Breakpoints = {
  sm: 375, // iPhone SE
  md: 414, // iPhone Pro
  lg: 768, // iPad
  xl: 1024, // iPad Pro
} as const;

// Type exports
export type TypographyKey = keyof typeof Typography;
export type SpacingKey = keyof typeof Spacing;
export type BorderRadiusKey = keyof typeof BorderRadius;
export type ShadowKey = keyof typeof Shadows;

// Helper functions
export const createTextStyle = (key: TypographyKey): TextStyle => Typography[key];
export const createSpacing = (key: SpacingKey): number => Spacing[key];
export const createBorderRadius = (key: BorderRadiusKey): number => BorderRadius[key];
export const createShadow = (key: ShadowKey): ViewStyle => Shadows[key];