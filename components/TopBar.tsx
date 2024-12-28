import { StyleSheet, ViewStyle, TouchableOpacity, Pressable } from 'react-native';
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
};

export function TopBar({ title, style }: TopBarProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const isSettings = pathname === '/settings';

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }, style]}>
      <GradientBackground intensity="light" />
      {isSettings ? (
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

      <ThemedText type="title" style={[styles.title, isSettings && styles.settingsTitle]}>
        {title}
      </ThemedText>

      {!isSettings && (
        <Pressable
          onPress={handleSettingsPress}
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && styles.pressed
          ]}
          hitSlop={20}
        >
          <IconSymbol
            name="gearshape.fill"
            size={32}
            color={colorScheme === 'dark' ? PastryColors.accent : PastryColors.chocolate}
          />
        </Pressable>
      )}
      {isSettings && <ThemedView style={styles.rightPlaceholder} />}
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
  settingsButton: {
    padding: 12,
    borderRadius: 12,
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