import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface HomeIconProps {
  size?: number;
  color: string;
  focused?: boolean;
}

export function OrdersIcon({ size = 28, color }: HomeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M14 6L22 11V20C22 21.1046 21.1046 22 20 22H8C6.89543 22 6 21.1046 6 20V11L14 6Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color + '20'}
      />
      <Path
        d="M10 22V14H18V22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="16" cy="8" r="2" fill={color} />
    </Svg>
  );
}

export function StockIcon({ size = 28, color }: HomeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Rect
        x="4"
        y="8"
        width="8"
        height="10"
        rx="1"
        stroke={color}
        strokeWidth={2}
        fill={color + '20'}
      />
      <Rect
        x="16"
        y="6"
        width="8"
        height="12"
        rx="1"
        stroke={color}
        strokeWidth={2}
        fill={color + '20'}
      />
      <Circle cx="8" cy="18" r="1.5" fill={color} />
      <Circle cx="20" cy="20" r="1.5" fill={color} />
    </Svg>
  );
}

export function StatisticsIcon({ size = 28, color }: HomeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Rect
        x="6"
        y="14"
        width="4"
        height="8"
        rx="1"
        fill={color}
      />
      <Rect
        x="12"
        y="8"
        width="4"
        height="14"
        rx="1"
        fill={color}
      />
      <Rect
        x="18"
        y="10"
        width="4"
        height="12"
        rx="1"
        fill={color}
      />
      <Path
        d="M4 22H24"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function AIIcon({ size = 28, color }: HomeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M14 8C15.6569 8 17 9.34315 17 11C17 11.3506 16.9398 11.6872 16.8293 12H18C19.1046 12 20 12.8954 20 14V17M8 17V14C8 12.8954 8.89543 12 10 12H11.1707C11.0602 11.6872 11 11.3506 11 11C11 9.34315 12.3431 8 14 8Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color + '20'}
      />
      <Path
        d="M10 17V20C10 21.1046 10.8954 22 12 22H16C17.1046 22 18 21.1046 18 20V17"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 21L22 19L24 18L22 17L21 15L20 17L18 18L20 19L21 21Z"
        fill={color}
      />
    </Svg>
  );
}

export function NeedsIcon({ size = 28, color }: HomeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Circle
        cx="14"
        cy="14"
        r="8"
        stroke={color}
        strokeWidth={2}
        fill={color + '20'}
      />
      <Path
        d="M14 10V14M14 18H14.01"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function AnalyticsIcon({ size = 28, color }: HomeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M4 4V24H24"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M8 18L12 14L16 16L20 10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx="8" cy="18" r="1.5" fill={color} />
      <Circle cx="12" cy="14" r="1.5" fill={color} />
      <Circle cx="16" cy="16" r="1.5" fill={color} />
      <Circle cx="20" cy="10" r="1.5" fill={color} />
    </Svg>
  );
}