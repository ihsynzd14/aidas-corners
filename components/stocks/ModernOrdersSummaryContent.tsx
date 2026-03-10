import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, ScrollView as RNScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ModernDatePicker } from './ModernDatePicker';
import { ModernOrdersSummaryTable } from './ModernOrdersSummaryTable';
import { OrdersTotalSummary } from './OrdersTotalSummary';
import { fetchOrdersByDate } from '@/utils/ordersData';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { SkeletonOrdersTable, SkeletonDatePicker } from './SkeletonLoader';
import { EnhancedErrorState } from './EnhancedErrorState';
import { SuccessToast } from './FeedbackComponents';
import { ModernBottomSheet } from './ModernBottomSheet';
import { EnhancedScrollView } from './EnhancedScrollView';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MIN_SHEET_HEIGHT = 250;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.8;

export function OrdersSummaryContent() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [ordersData, setOrdersData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'server' | 'unknown'>('unknown');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<RNScrollView>(null);

  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
  };

  const loadOrders = async () => {
    try {
      setError(null);
      const data = await fetchOrdersByDate(selectedDate);
      setOrdersData(data);
      if (!loading) {
        setToastMessage('Sifarişlər uğurla yükləndi');
        setShowSuccessToast(true);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Sifarişləri yükləyərkən xəta baş verdi';
      
      if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        setErrorType('network');
      } else if (errorMessage.includes('server') || errorMessage.includes('500')) {
        setErrorType('server');
      } else {
        setErrorType('unknown');
      }
      
      setError(errorMessage);
      console.error('Error loading orders:', error);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    loadOrders().finally(() => setLoading(false));
  };

  const onRefresh = React.useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadOrders();
  }, [selectedDate]);

  useEffect(() => {
    setLoading(true);
    loadOrders().finally(() => setLoading(false));
  }, [selectedDate]);

  if (loading) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <ThemedView style={{ padding: 16 }}>
          <SkeletonDatePicker />
          <SkeletonOrdersTable />
        </ThemedView>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EnhancedErrorState 
          error={error} 
          type={errorType}
          onRetry={handleRetry}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <SuccessToast
        visible={showSuccessToast}
        message={toastMessage}
        onHide={() => setShowSuccessToast(false)}
        type="success"
      />
      
      <EnhancedScrollView
        scrollRef={scrollRef}
        onRefresh={onRefresh}
        contentContainerStyle={{ 
          padding: 16,
          paddingBottom: MIN_SHEET_HEIGHT + insets.bottom
        }}
        isExpanded={isExpanded}
      >
        <ModernDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <ModernOrdersSummaryTable 
          ordersData={ordersData} 
          selectedDate={selectedDate}
          onDataChange={loadOrders}
        />
      </EnhancedScrollView>

      <ModernBottomSheet
        isExpanded={isExpanded}
        onToggle={toggleExpanded}
      >
        <OrdersTotalSummary 
          ordersData={ordersData} 
          SHEET_HEIGHT={EXPANDED_HEIGHT}
          scrollRef={scrollRef}
          selectedDate={selectedDate}
        />
      </ModernBottomSheet>
    </ThemedView>
  );
}
