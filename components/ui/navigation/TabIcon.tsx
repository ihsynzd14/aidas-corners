import React from 'react';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { AnimatedIcon } from './AnimatedIcon';

const AnimatedIconComponent = Animated.createAnimatedComponent(AnimatedIcon);

interface TabIconProps {
  name: 'house.fill' | 'paperplane.fill'  | 'cart.fill' ;
  color: string;
  focused: boolean;
  size?: number;
}

export function TabIcon({ name, color, focused, size = 28 }: TabIconProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ 
      scale: withSpring(focused ? 1.2 : 1, {
        damping: 12,
        stiffness: 100
      })
    }],
    opacity: withSpring(focused ? 1 : 0.7)
  }));

  return (
    <AnimatedIconComponent
      style={animatedStyle}
      name={name}
      size={size}
      color={color}
    />
  );
}