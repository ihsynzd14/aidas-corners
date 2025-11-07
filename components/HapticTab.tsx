import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isFocused = props.accessibilityState?.selected;

  const handlePressIn = (ev: any) => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    props.onPressIn?.(ev);
  };

  const tabStyle = {
    backgroundColor: isFocused ? colors.tabActiveBackground : 'transparent',
  };

  // Get the tab title from props for accessibility
  const getTabLabel = () => {
    if (props.children && typeof props.children === 'object') {
      // Try to extract text from children if possible
      return 'Tab';
    }
    return 'Tab';
  };

  return (
    <Pressable
      {...props}
      style={[styles.tab, tabStyle]}
      onPressIn={handlePressIn}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={`${getTabLabel()} ${isFocused ? 'selected' : 'not selected'}`}
      accessibilityHint="Double tap to navigate to this section"
    />
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
    minHeight: 44, // Accessibility minimum touch target
  },
});
