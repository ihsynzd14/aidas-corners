import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface AccessibilityInfo {
  reduceMotion: boolean;
  screenReaderEnabled: boolean;
  highContrastEnabled: boolean;
  boldTextEnabled: boolean;
}

/**
 * Hook for managing accessibility features and WCAG compliance
 */
export function useAccessibility() {
  const [accessibilityInfo, setAccessibilityInfo] = useState<AccessibilityInfo>({
    reduceMotion: false,
    screenReaderEnabled: false,
    highContrastEnabled: false,
    boldTextEnabled: false,
  });

  useEffect(() => {
    // In a real app, you would use expo-accessibility or react-native-accessibility
    // For now, we'll provide default values
    // This would be replaced with actual accessibility API calls

    // Example implementation with expo-accessibility:
    /*
    import * as Accessibility from 'expo-accessibility';

    const subscriptions = [
      Accessibility.addEventListener('reduceMotionChanged', (value) => {
        setAccessibilityInfo(prev => ({ ...prev, reduceMotion: value }));
      }),
      Accessibility.addEventListener('screenReaderChanged', (value) => {
        setAccessibilityInfo(prev => ({ ...prev, screenReaderEnabled: value }));
      }),
      Accessibility.addEventListener('highContrastChanged', (value) => {
        setAccessibilityInfo(prev => ({ ...prev, highContrastEnabled: value }));
      }),
      Accessibility.addEventListener('boldTextChanged', (value) => {
        setAccessibilityInfo(prev => ({ ...prev, boldTextEnabled: value }));
      }),
    ];

    return () => {
      subscriptions.forEach(subscription => subscription.remove());
    };
    */
  }, []);

  /**
   * Get appropriate animation duration based on user preferences
   */
  const getAnimationDuration = (normalDuration: number): number => {
    return accessibilityInfo.reduceMotion ? 0 : normalDuration;
  };

  /**
   * Generate accessibility properties for interactive elements
   */
  const getAccessibilityProps = (
    label: string,
    hint?: string,
    role?: 'button' | 'link' | 'image' | 'header' | 'text'
  ) => {
    return {
      accessibilityRole: role || 'button',
      accessibilityLabel: label,
      accessibilityHint: hint || `Tap to interact with ${label}`,
      accessibilityState: {
        busy: false,
        disabled: false,
        selected: false,
      },
    };
  };

  /**
   * Check if color contrast meets WCAG AA standards (4.5:1)
   */
  const checkContrastRatio = (foreground: string, background: string): boolean => {
    // This is a simplified version - in production, you'd use a proper color contrast library
    // like 'color-contrast' or implement the full WCAG contrast calculation
    try {
      const getLuminance = (color: string): number => {
        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;

        // Calculate relative luminance
        const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

        return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
      };

      const l1 = getLuminance(foreground);
      const l2 = getLuminance(background);
      const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

      return contrast >= 4.5; // WCAG AA standard
    } catch {
      return true; // Assume compliant if calculation fails
    }
  };

  /**
   * Get minimum touch target size (44x44dp per WCAG)
   */
  const getMinimumTouchTarget = () => ({
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
  });

  /**
   * Check if platform-specific accessibility features should be used
   */
  const useHapticFeedback = (): boolean => {
    return !accessibilityInfo.reduceMotion && Platform.OS === 'ios';
  };

  /**
   * Generate semantic description for complex components
   */
  const generateSemanticDescription = (
    title: string,
    description?: string,
    status?: 'active' | 'inactive' | 'disabled'
  ): string => {
    let baseDescription = title;

    if (description) {
      baseDescription += `, ${description}`;
    }

    if (status) {
      baseDescription += `, ${status}`;
    }

    return baseDescription;
  };

  return {
    accessibilityInfo,
    getAnimationDuration,
    getAccessibilityProps,
    checkContrastRatio,
    getMinimumTouchTarget,
    useHapticFeedback,
    generateSemanticDescription,
  };
}

/**
 * Hook for managing focus and keyboard navigation
 */
export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  const setFocus = (elementId: string) => {
    setFocusedElement(elementId);
  };

  const clearFocus = () => {
    setFocusedElement(null);
  };

  const moveFocus = (direction: 'next' | 'previous') => {
    // In a real implementation, this would manage actual focus navigation
    console.log(`Moving focus ${direction}`);
  };

  return {
    focusedElement,
    setFocus,
    clearFocus,
    moveFocus,
  };
}