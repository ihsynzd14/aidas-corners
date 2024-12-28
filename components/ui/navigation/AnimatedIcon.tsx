import React, { forwardRef } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { IconSymbol, IconSymbolName } from '../IconSymbol';

interface AnimatedIconProps {
  name: IconSymbolName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}

export const AnimatedIcon = forwardRef<typeof IconSymbol, AnimatedIconProps>(
  ({ name, size, color, style }, ref) => (
    <IconSymbol
      ref={ref}
      name={name}
      size={size}
      color={color}
      style={style}
    />
  )
);