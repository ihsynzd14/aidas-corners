// components/TopBar.tsx
import { StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './ui/IconSymbol';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { GradientBackground } from './ui/GradientBackground';
import { PastryColors, Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter, usePathname } from 'expo-router';

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
      {isSettings && (
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol
            name="chevron.left"
            size={32}
            color={colorScheme === 'dark' ? Colors.dark.icon : Colors.light.icon}
            style={{ transform: [{ rotate: '180deg' }] }}
          />
        </TouchableOpacity>
      )}
      <ThemedText type="title" style={[styles.title, isSettings && styles.settingsTitle]}>
        {title}
      </ThemedText>
      {!isSettings && (
        <ThemedView style={styles.iconContainer}>
          <IconSymbol
            name="gearshape.fill"
            size={32}
            color={colorScheme === 'dark' ? PastryColors.accent : PastryColors.chocolate}
            onPress={handleSettingsPress}
          />
        </ThemedView>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 53, 49, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  settingsTitle: {
    flex: 1,
    textAlign: 'center',
  },
  iconContainer: {
    backgroundColor: 'transparent',
  },
});
