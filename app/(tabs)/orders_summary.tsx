import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { TopBar } from '@/components/TopBar';
import { OrdersSummaryContent } from '@/components/stocks/OrdersSummaryContent';

export default function OrdersSummaryScreen() {
  return (
    <ThemedView style={styles.container}>
      <TopBar 
        title="Sifarişlər Cədvəli" 
        style={styles.topBar}
      />
      <OrdersSummaryContent />
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
});