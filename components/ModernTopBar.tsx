import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Typography, ComponentTokens, Spacing } from '@/constants/DesignTokens';

interface ModernTopBarProps {
  title: string;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  showBackButton?: boolean;
  transparent?: boolean;
}

export function ModernTopBar({
  title,
  onBackPress,
  onMenuPress,
  rightIcon,
  onRightIconPress,
  showBackButton = false,
  transparent = false,
}: ModernTopBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const containerStyle = {
    height: ComponentTokens.topBar.height + insets.top,
    paddingTop: insets.top,
    backgroundColor: transparent ? 'transparent' : colors.background,
    borderBottomColor: colors.tabBorder,
  };

  const textColor = transparent ? colors.text : colors.text;

  return (
    <View style={[styles.container, containerStyle]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={transparent ? 'transparent' : colors.background}
        translucent={transparent}
      />

      <View style={styles.content}>
        {/* Left Section - Back Button or Menu */}
        <View style={styles.leftSection}>
          {showBackButton && onBackPress ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onBackPress}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              accessibilityHint="Navigate to previous screen"
            >
              <Text style={[styles.backIcon, { color: textColor }]}>
                ←
              </Text>
            </TouchableOpacity>
          ) : onMenuPress ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onMenuPress}
              accessibilityRole="button"
              accessibilityLabel="Menu"
              accessibilityHint="Open navigation menu"
            >
              <Text style={[styles.menuIcon, { color: textColor }]}>
                ☰
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* Center Section - Title */}
        <View style={styles.centerSection}>
          <Text
            style={[
              Typography.headingMedium,
              { color: textColor },
              styles.title,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {title}
          </Text>
        </View>

        {/* Right Section - Custom Icon or Placeholder */}
        <View style={styles.rightSection}>
          {rightIcon && onRightIconPress ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onRightIconPress}
              accessibilityRole="button"
              accessibilityLabel="Action"
              accessibilityHint="Perform action"
            >
              {rightIcon}
            </TouchableOpacity>
          ) : rightIcon ? (
            <View style={styles.iconContainer}>
              {rightIcon}
            </View>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: ComponentTokens.topBar.height,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
  },
  iconButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  iconContainer: {
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '300',
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  menuIcon: {
    fontSize: 20,
    fontWeight: '400',
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  placeholder: {
    width: 44,
    height: 44,
  },
});