import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface EnhancedTabBarProps {
  children: React.ReactNode;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const MIN_TAB_WIDTH = 60;

export function EnhancedTabBar({ children }: EnhancedTabBarProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'light'];

  const containerStyle = {
    backgroundColor: colors.tabBackground,
    borderTopColor: colors.tabBorder,
    paddingBottom: insets.bottom,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.tabContainer}>
        {children}
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
    flexDirection: 'row',
    // Remove all shadow and elevation properties
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 4,
    minHeight: 60,
    alignItems: 'center',
  },
});