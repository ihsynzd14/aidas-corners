import { StyleSheet, SafeAreaView, Dimensions, Platform } from 'react-native';
import { TopBar } from '../../components/TopBar';
import { MenuContainer } from '../../components/MenuContainer';
import { ThemedView } from '../../components/ThemedView';
import { useColorScheme } from '../../hooks/useColorScheme';
import { IconSymbolName } from '../../components/ui/IconSymbol';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
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
      title: 'Məhsul Statistikası',
      description: 'Məhsulların satış statistikasını izləyin',
      iconName: 'list.clipboard.fill',
      gradient: ['#FFD93D', '#F4C000'],
    },
    {
      title: 'AI Asistan',
      description: 'Yapay zeka destekli analiz ve öneriler',
      iconName: 'ai.fill',
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
              onPress={() => router.push('/new_orders')}
              delay={100}
            />
              <MenuContainer
                {...menuItems[1]}
                onPress={() =>  router.push('/orders_summary')}
                delay={200}
              />
            </ThemedView>

            <ThemedView style={[styles.row, styles.centerRow]}>
              <MenuContainer
                {...menuItems[2]}
                onPress={() => router.push('/(tabs)/product_statistics')}
                delay={300}
                compact={true}
              />
            </ThemedView>

            <ThemedView style={styles.row}>
              <MenuContainer
                {...menuItems[3]}
                onPress={() => router.push('/(tabs)/ai_assistant' as any)}
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
    paddingHorizontal: Dimensions.get('window').width * 0.06,
    paddingTop: Platform.OS === 'ios' ? 12 : 24,
  },
  content: {
    flex: 1,
    paddingTop: Dimensions.get('window').height * 0.02,
    paddingBottom: Dimensions.get('window').height * 0.1,
  },
  grid: {
    flex: 1,
    padding: Dimensions.get('window').width * 0.02,
    gap: Dimensions.get('window').height * 0.01,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    gap: Dimensions.get('window').width * 0.02,
  },
  centerRow: {
    paddingVertical: Dimensions.get('window').height * 0.015,
  },
});