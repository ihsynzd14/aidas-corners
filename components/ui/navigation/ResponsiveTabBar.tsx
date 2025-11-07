import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  LayoutChangeEvent,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface ResponsiveTabBarProps {
  children: React.ReactNode;
  showScrollIndicator?: boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const MIN_TAB_WIDTH = 70; // Minimum width for each tab
const PRIORITY_TABS_COUNT = 3; // First 3 tabs are always visible

export function ResponsiveTabBar({
  children,
  showScrollIndicator = false
}: ResponsiveTabBarProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'light'];
  const scrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH);
  const [needsScroll, setNeedsScroll] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);

    // Calculate if we need scroll based on number of children
    const childrenCount = React.Children.count(children);
    const requiredWidth = childrenCount * MIN_TAB_WIDTH;
    setNeedsScroll(requiredWidth > width);
  };

  const containerStyle = {
    backgroundColor: colors.tabBackground,
    borderTopColor: colors.tabBorder,
    paddingBottom: insets.bottom,
  };

  // Show indicator if there's overflow and we're not at the end
  const showRightIndicator = showScrollIndicator && needsScroll;
  const showLeftIndicator = showScrollIndicator && needsScroll;

  return (
    <View style={[styles.container, containerStyle]} onLayout={handleLayout}>
      <View style={styles.scrollContainer}>
        {showLeftIndicator && (
          <View style={[styles.indicator, styles.leftIndicator, { backgroundColor: colors.tabBorder }]} />
        )}

        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.tabContainer,
            { minWidth: needsScroll ? containerWidth * 1.2 : containerWidth }
          ]}
          decelerationRate="fast"
          snapToInterval={MIN_TAB_WIDTH}
          snapToAlignment="center"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {React.Children.map(children, (child, index) => {
            // First 3 tabs (priority tabs) get minimum width guarantee
            const isPriorityTab = index < PRIORITY_TABS_COUNT;
            const tabWidth = isPriorityTab ? Math.max(MIN_TAB_WIDTH, containerWidth / 4) : MIN_TAB_WIDTH;

            return (
              <View
                key={index}
                style={[styles.tabWrapper, { minWidth: tabWidth, flex: needsScroll ? 'none' : 1 }]}
              >
                {child}
              </View>
            );
          })}
        </ScrollView>

        {showRightIndicator && (
          <View style={[styles.indicator, styles.rightIndicator, { backgroundColor: colors.tabBorder }]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    minHeight: 60,
  },
  scrollContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingHorizontal: 4,
  },
  tabWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingHorizontal: 4,
  },
  indicator: {
    width: 30,
    height: 2,
    position: 'absolute',
    top: 0,
    opacity: 0.5,
  },
  leftIndicator: {
    left: 0,
  },
  rightIndicator: {
    right: 0,
  },
});