import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface TabLabelProps {
  label: string;
  color: string;
  focused: boolean;
}

export function TabLabel({ label, color, focused }: TabLabelProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withSpring(focused ? 1 : 0.7),
    transform: [{ 
      translateY: withSpring(focused ? 0 : 2, {
        damping: 12,
        stiffness: 100
      })
    }]
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
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.2,
  }
});