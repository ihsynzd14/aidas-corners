import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { Breakpoints } from '@/constants/DesignTokens';

interface ResponsiveDimensions {
  width: number;
  height: number;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  scale: number; // Scale factor based on screen width (375px = base)
  fontScale: number; // Font scale factor
}

const BASE_WIDTH = 375; // iPhone SE as base

export function useResponsiveDimensions(): ResponsiveDimensions {
  const [dimensions, setDimensions] = useState<ScaledSize>(() => 
    Dimensions.get('window')
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const width = dimensions.width;
  const height = dimensions.height;
  
  // Calculate scale factor (375px = 1.0)
  const scale = Math.max(0.8, Math.min(1.2, width / BASE_WIDTH));
  
  // Font scale (slightly less aggressive than general scale)
  const fontScale = Math.max(0.85, Math.min(1.15, width / BASE_WIDTH));

  return {
    width,
    height,
    isSmallScreen: width < Breakpoints.md,
    isMediumScreen: width >= Breakpoints.md && width < Breakpoints.lg,
    isLargeScreen: width >= Breakpoints.lg,
    scale,
    fontScale,
  };
}

// Helper function to scale font sizes
export function scaleFontSize(baseSize: number, fontScale: number): number {
  return Math.round(baseSize * fontScale);
}

// Helper function to scale spacing
export function scaleSpacing(baseSpacing: number, scale: number): number {
  return Math.round(baseSpacing * scale);
}

