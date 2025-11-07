import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface PastryIconProps {
  name: 'home' | 'orders' | 'table' | 'statistics' | 'analytics' | 'ai';
  size?: number;
  color: string;
  focused?: boolean;
}

export function PastryIcon({ name, size = 24, color, focused }: PastryIconProps) {
  const strokeWidth = 2;
  const opacity = focused ? 1 : 0.6;

  const renderIcon = () => {
    switch (name) {
      case 'home':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* House shape with pastry chimney */}
            <Path
              d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
            {/* Small chimney representing pastry oven */}
            <Rect
              x="16"
              y="6"
              width="2"
              height="4"
              fill={color}
              opacity={opacity}
            />
            <Path
              d="M9 22V12H15V22"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
          </Svg>
        );

      case 'orders':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Shopping cart with pastry items */}
            <Path
              d="M9 2C9.55228 2 10 2.44772 10 3C10 3.55228 9.55228 4 9 4C8.44772 4 8 3.55228 8 3C8 2.44772 8.44772 2 9 2Z"
              fill={color}
              opacity={opacity}
            />
            <Path
              d="M15 2C15.5523 2 16 2.44772 16 3C16 3.55228 15.5523 4 15 4C14.4477 4 14 3.55228 14 3C14 2.44772 14.4477 2 15 2Z"
              fill={color}
              opacity={opacity}
            />
            <Path
              d="M3 3H5L5.4 5.6M7.8 19H17M17 19C17 20.1046 16.1046 21 15 21C13.8954 21 13 20.1046 13 19C13 17.8954 13.8954 17 15 17C16.1046 17 17 17.8954 17 19ZM7 19C7 20.1046 6.10457 21 5 21C3.89543 21 3 20.1046 3 19C3 17.8954 3.89543 17 5 17C6.10457 17 7 17.8954 7 19Z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
            <Path
              d="M5 7H18L16 16H7L5 7Z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
          </Svg>
        );

      case 'table':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Table with spreadsheet grid */}
            <Rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
            {/* Grid lines representing table */}
            <Path
              d="M3 9H21M3 15H21M9 3V21M15 3V21"
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          </Svg>
        );

      case 'statistics':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Bar chart with pastry-themed colors */}
            <Path
              d="M18 20V10M12 20V4M6 20V14"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
            {/* Small dots representing data points */}
            <Circle cx="18" cy="10" r="1" fill={color} opacity={opacity} />
            <Circle cx="12" cy="4" r="1" fill={color} opacity={opacity} />
            <Circle cx="6" cy="14" r="1" fill={color} opacity={opacity} />
          </Svg>
        );

      case 'analytics':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Line chart with trend */}
            <Path
              d="M3 3V21H21"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
            <Path
              d="M7 12L10 9L14 15L18 7"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
            {/* Data points */}
            <Circle cx="7" cy="12" r="1.5" fill={color} opacity={opacity} />
            <Circle cx="10" cy="9" r="1.5" fill={color} opacity={opacity} />
            <Circle cx="14" cy="15" r="1.5" fill={color} opacity={opacity} />
            <Circle cx="18" cy="7" r="1.5" fill={color} opacity={opacity} />
          </Svg>
        );

      case 'ai':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Chef hat with AI spark */}
            <Path
              d="M12 2C13.6569 2 15 3.34315 15 5C15 5.35064 14.9398 5.68722 14.8293 6H16C17.1046 6 18 6.89543 18 8V11M6 11V8C6 6.89543 6.89543 6 8 6H9.17071C9.06022 5.68722 9 5.35064 9 5C9 3.34315 10.3431 2 12 2Z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
            {/* Chef hat base */}
            <Path
              d="M8 11V16C8 17.1046 8.89543 18 10 18H14C15.1046 18 16 17.1046 16 16V11"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
            {/* AI spark indicator */}
            <Path
              d="M19 21L20 19L22 18L20 17L19 15L18 17L16 18L18 19L19 21Z"
              fill={color}
              opacity={opacity}
            />
          </Svg>
        );

      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderIcon()}</View>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});