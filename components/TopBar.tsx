import { StyleSheet, ViewStyle, TouchableOpacity, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './ui/IconSymbol';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { GradientBackground } from './ui/GradientBackground';
import { PastryColors, Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter, usePathname } from 'expo-router';
import { Platform } from 'react-native';

type TopBarProps = {
  title: string;
  style?: ViewStyle;
  rightComponent?: React.ReactNode;
};

export function TopBar({ title, style, rightComponent }: TopBarProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const isSettings = pathname === '/settings';
  const isNotificationHistory = pathname === '/notification_history';

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleNotificationsPress = () => {
    router.push('/notification_history');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }, style]}>
      <GradientBackground intensity="light" />
      {(isSettings || isNotificationHistory) ? (
        <Pressable 
          onPress={handleBack} 
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed
          ]}
          hitSlop={20}
        >
          <IconSymbol
            name="chevron.left"
            size={32}
            color={colorScheme === 'dark' ? Colors.dark.icon : Colors.light.icon}
          />
        </Pressable>
      ) : (
        <ThemedView style={styles.leftPlaceholder} />
      )}

      <ThemedText type="title" style={[styles.title, (isSettings || isNotificationHistory) && styles.settingsTitle]}>
        {title}
      </ThemedText>

      {rightComponent ? (
        rightComponent
      ) : !isSettings && !isNotificationHistory && (
        <View style={styles.rightButtons}>
          <Pressable
            onPress={handleNotificationsPress}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed
            ]}
            hitSlop={20}
          >
            <IconSymbol
              name="bell.fill"
              size={28}
              color={colorScheme === 'dark' ? PastryColors.accent : PastryColors.chocolate}
            />
          </Pressable>

          <Pressable
            onPress={handleSettingsPress}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed
            ]}
            hitSlop={20}
          >
            <IconSymbol
              name="gearshape.fill"
              size={28}
              color={colorScheme === 'dark' ? PastryColors.accent : PastryColors.chocolate}
            />
          </Pressable>
        </View>
      )}
      {(isSettings || isNotificationHistory) && !rightComponent && <ThemedView style={styles.rightPlaceholder} />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 53, 49, 0.1)',
  },
  backButton: {
    padding: 12,
    borderRadius: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        transform: [{ scale: 0.96 }],
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  settingsTitle: {
    textAlign: 'center',
  },
  leftPlaceholder: {
    width: 56,
    backgroundColor: 'transparent',
  },
  rightPlaceholder: {
    width: 56,
    backgroundColor: 'transparent',
  },
});