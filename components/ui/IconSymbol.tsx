import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React, { forwardRef } from 'react';
import { StyleProp, ViewStyle, TouchableOpacity } from 'react-native';

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'gearshape.fill': 'settings',
  'bell.fill': 'notifications',
  'cart.fill': 'shopping-cart',
  'box.truck.fill': 'local-shipping',
  'list.clipboard.fill': 'assignment',
  'person.2.fill': 'people',
  'save': 'save',
  'ai.fill': 'psychology',
} as const;

export type IconSymbolName = keyof typeof MAPPING;

type IconSymbolProps = {
  name: IconSymbolName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
  onPress?: () => void;
};

export const IconSymbol = forwardRef<any, IconSymbolProps>(
  ({ name, size = 24, color, style, onPress }, ref) => {
    const iconComponent = (
      <MaterialIcons 
        ref={ref}
        name={MAPPING[name]} 
        size={size} 
        color={color} 
      />
    );

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} style={style}>
          {iconComponent}
        </TouchableOpacity>
      );
    }

    return iconComponent;
  }
);