import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  Text,
  ViewStyle,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Typography, ComponentTokens, Animation, BorderRadius } from '@/constants/DesignTokens';

interface ModernMenuContainerProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function ModernMenuContainer({
  title,
  subtitle,
  icon,
  onPress,
  variant = 'secondary',
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: ModernMenuContainerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (!disabled) {
      Animated.timing(scaleValue, {
        toValue: 0.98,
        duration: Animation.fast,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: Animation.fast,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  const getContainerStyle = () => {
    const baseStyle = variant === 'primary'
      ? ComponentTokens.primaryMenuCard
      : ComponentTokens.menuCard;

    const backgroundColor = disabled
      ? colors.backgroundSecondary
      : variant === 'primary'
      ? colors.tint + '10' // Very subtle background tint
      : colors.background;

    const borderColor = variant === 'primary'
      ? colors.tint + '30'
      : 'transparent';

    return [
      styles.container,
      baseStyle,
      {
        backgroundColor,
        borderWidth: variant === 'primary' ? 1 : 0,
        borderColor,
        opacity: disabled ? 0.6 : 1,
      },
      style,
    ];
  };

  const getTextColor = () => {
    return disabled ? colors.textSecondary : colors.text;
  };

  const getSubtitleColor = () => {
    return disabled ? colors.textSecondary : colors.textSecondary;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        style={getContainerStyle()}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint || `Navigate to ${title}`}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {icon}
          </View>

          <View style={styles.textContainer}>
            <Text
              style={[
                Typography.headingSmall,
                { color: getTextColor() },
                styles.title,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>

            {subtitle && (
              <Text
                style={[
                  Typography.bodyMedium,
                  { color: getSubtitleColor() },
                  styles.subtitle,
                ]}
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            )}
          </View>

          <View style={styles.chevronContainer}>
            <Text style={[styles.chevron, { color: colors.textSecondary }]}>
              ›
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    // Shadow and elevation handled by ComponentTokens
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    height: 40,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    marginTop: 2,
  },
  chevronContainer: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
  },
});