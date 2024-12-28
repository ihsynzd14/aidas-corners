import { Stack } from 'expo-router';
import { Appearance, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { TopBar } from '@/components/TopBar';
import { SettingItem } from '@/components/settings/SettingItem';
import { ThemedText } from '@/components/ThemedText';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const handleThemeToggle = (value: boolean) => {
    requestAnimationFrame(() => {
      Appearance.setColorScheme(value ? 'dark' : 'light');
    });
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <TopBar 
        title="Tənzimləmələr"
        style={styles.topBar}
      />
      
      <ThemedView style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Görünüş</ThemedText>
          <SettingItem
            title="Qaranlıq Rejim"
            description="İşıqlı və qaranlıq mövzu arasında keçid"
            icon="gearshape.fill"
            isSwitch={true}
            value={isDarkMode}
            onToggle={handleThemeToggle}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Hesab</ThemedText>
          <SettingItem
            title="Profil"
            description="Hesab məlumatlarınızı idarə edin"
            icon="person.2.fill"
          />
          <SettingItem
            title="Bildirişlər"
            description="Push bildirişlərini tənzimləyin"
            icon="bell.fill"
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Ümumi</ThemedText>
          <SettingItem
            title="Dil"
            description="Tətbiq dilini dəyişin"
            icon="list.clipboard.fill"
          />
          <SettingItem
            title="Haqqında"
            description="Tətbiq məlumatları və versiya"
            icon="cart.fill"
          />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    marginLeft: 4,
  },
});