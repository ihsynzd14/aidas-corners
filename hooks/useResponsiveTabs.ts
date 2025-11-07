import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

interface ResponsiveTabConfig {
  minTabWidth: number;
  maxTabWidth: number;
  priorityTabs: number;
  containerPadding: number;
}

const defaultConfig: ResponsiveTabConfig = {
  minTabWidth: 60,
  maxTabWidth: 100,
  priorityTabs: 3,
  containerPadding: 8,
};

export function useResponsiveTabs(
  tabCount: number,
  config: Partial<ResponsiveTabConfig> = {}
) {
  const finalConfig = { ...defaultConfig, ...config };
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [visibleTabCount, setVisibleTabCount] = useState(tabCount);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    const availableWidth = screenWidth - finalConfig.containerPadding;
    const maxVisibleTabs = Math.floor(availableWidth / finalConfig.minTabWidth);

    // Calculate if we need scrolling
    if (tabCount > maxVisibleTabs) {
      setNeedsScroll(true);
      setVisibleTabCount(maxVisibleTabs);
    } else {
      setNeedsScroll(false);
      setVisibleTabCount(tabCount);
    }
  }, [screenWidth, tabCount, finalConfig]);

  const getTabWidth = (index: number) => {
    if (!needsScroll) {
      return screenWidth / tabCount;
    }

    // Priority tabs get more space
    if (index < finalConfig.priorityTabs) {
      const availableForPriority = screenWidth * 0.6; // 60% for priority tabs
      return availableForPriority / finalConfig.priorityTabs;
    }

    // Remaining tabs share the rest
    const remainingWidth = screenWidth * 0.4; // 40% for remaining tabs
    const remainingTabs = Math.max(1, visibleTabCount - finalConfig.priorityTabs);
    return Math.min(finalConfig.maxTabWidth, remainingWidth / remainingTabs);
  };

  const getTabVisibility = (index: number) => {
    // Priority tabs are always visible
    if (index < finalConfig.priorityTabs) {
      return true;
    }

    // Other tabs depend on available space
    return index < visibleTabCount;
  };

  return {
    needsScroll,
    visibleTabCount,
    getTabWidth,
    getTabVisibility,
    screenWidth,
  };
}