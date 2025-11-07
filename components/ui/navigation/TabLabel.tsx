import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface TabLabelProps {
  label: string;
  color: string;
  focused: boolean;
}

export function TabLabel({ label, color, focused }: TabLabelProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0.6, { duration: 150 }),
  }));

  return (
    <Animated.Text
      style={[
        styles.label,
        { color },
        animatedStyle
      ]}>
      {label}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.2,
    textAlign: 'center',
  }
});