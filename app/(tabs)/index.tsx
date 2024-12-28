import { StyleSheet, SafeAreaView } from 'react-native';
import { TopBar } from '../../components/TopBar';
import { MenuContainer } from '../../components/MenuContainer';
import { ThemedView } from '../../components/ThemedView';
import { useColorScheme } from '../../hooks/useColorScheme';
import { IconSymbolName } from '../../components/ui/IconSymbol';

export default function HomeScreen() {
  const colorScheme = useColorScheme();

  const handleSettingsPress = () => {
    // Handle settings press
  };

  const menuItems: Array<{
    title: string;
    description: string;
    iconName: IconSymbolName;
    gradient?: string[];
  }> = [
    {
      title: 'Yeni Sifarişlər',
      description: 'Daxil olan sifarişləri və sorğuları idarə edin',
      iconName: 'bell.fill',
      gradient: ['#FF6B6B', '#EE5D5D'],
    },
    {
      title: 'Stoklar və Hazırlıq',
      description: 'İnventarı və mətbəx hazırlığını izləyin',
      iconName: 'cart.fill',
      gradient: ['#4ECDC4', '#45B7AF'],
    },
    {
      title: 'Çatdırılma',
      description: 'Aktiv çatdırılmaları və marşrutları izləyin',
      iconName: 'box.truck.fill',
      gradient: ['#FFD93D', '#F4C000'],
    },
    {
      title: 'Məhsullar və Analiz',
      description: 'Menyunu yeniləyin və məhsulları idarə edin',
      iconName: 'list.clipboard.fill',
      gradient: ['#95DAB6', '#7CC49E'],
    },
    {
      title: 'İşçilər',
      description: 'Komandanı və qrafikləri idarə edin',
      iconName: 'person.2.fill',
      gradient: ['#6C5CE7', '#5A4BD1'],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <TopBar 
          title="Aida's Corner" 
          style={styles.topBar}
        />
        
        <ThemedView style={styles.content}>
          <ThemedView style={styles.grid}>
            <ThemedView style={styles.row}>
              <MenuContainer
                {...menuItems[0]}
                onPress={() => {}}
                delay={100}
              />
              <MenuContainer
                {...menuItems[1]}
                onPress={() => {}}
                delay={200}
              />
            </ThemedView>

            <ThemedView style={[styles.row, styles.centerRow]}>
              <MenuContainer
                {...menuItems[2]}
                onPress={() => {}}
                delay={300}
                compact={true}
              />
            </ThemedView>

            <ThemedView style={styles.row}>
              <MenuContainer
                {...menuItems[3]}
                onPress={() => {}}
                delay={400}
              />
              <MenuContainer
                {...menuItems[4]}
                onPress={() => {}}
                delay={500}
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  content: {
    flex: 1,
    paddingTop: 12, // Add padding to prevent content from being hidden behind tab bar
    paddingBottom: 80, // Add padding to prevent content from being hidden behind tab bar
  },
  grid: {
    flex: 1,
    padding: 8,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  centerRow: {
    paddingVertical: 12,
  },
});