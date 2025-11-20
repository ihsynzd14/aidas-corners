import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { OrdersSummaryTopBar } from '@/components/stocks/OrdersSummaryTopBar';
import { OrdersSummaryContent } from '@/components/stocks/OrdersSummaryContent';
import { colorScheme } from '@/constants/colorScheme';

export default function OrdersSummaryScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <ThemedView style={styles.container}>
      <OrdersSummaryTopBar 
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        style={styles.topBar}
      />
      <OrdersSummaryContent 
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 0,
    color: colorScheme.backgroundLight
  },
});