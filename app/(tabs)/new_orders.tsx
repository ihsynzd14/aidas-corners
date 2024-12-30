import { StyleSheet, ScrollView } from 'react-native';
import { TopBar } from '@/components/TopBar';
import { ThemedView } from '@/components/ThemedView';
import { OrderForm } from '@/components/orders/OrderForm';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewOrdersScreen() {
  return (
      <ThemedView style={styles.container}>
        <TopBar 
          title="Yeni Sifarişlər" 
          style={styles.topBar}
        />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <OrderForm />
        </ScrollView>
      </ThemedView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
});