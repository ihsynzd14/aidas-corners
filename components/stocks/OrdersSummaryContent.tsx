import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, ScrollView as RNScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

import { ModernOrdersSummaryTable } from './ModernOrdersSummaryTable';
import { OrdersTotalSummary } from './OrdersTotalSummary';
import { fetchOrdersByDate } from '@/utils/ordersData';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { SkeletonOrdersTable } from './SkeletonLoader';
import { EnhancedErrorState } from './EnhancedErrorState';
import { SuccessToast } from './FeedbackComponents';
import { Ionicons } from '@expo/vector-icons';
import { PastryColors } from '@/constants/Colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MIN_SHEET_HEIGHT = 250;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.8;

interface OrdersSummaryContentProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

export function OrdersSummaryContent({ selectedDate: propSelectedDate, onDateChange }: OrdersSummaryContentProps) {
  const [internalSelectedDate, setInternalSelectedDate] = useState(new Date());

  // Use prop date if provided, otherwise use internal state
  const selectedDate = propSelectedDate || internalSelectedDate;

  const handleDateChange = (date: Date) => {
    setInternalSelectedDate(date);
    onDateChange?.(date);
  };
  const [ordersData, setOrdersData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'server' | 'unknown'>('unknown');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<RNScrollView | null>(null);

  const animation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: withSpring(isExpanded ? EXPANDED_HEIGHT : MIN_SHEET_HEIGHT, {
        damping: 95,
        stiffness: 95,
      }),
    };
  });

  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
  };

  const loadOrders = async () => {
    try {
      setError(null);
      const data = await fetchOrdersByDate(selectedDate);
      console.log('=== OrdersSummaryContent - ordersData ===');
      console.log('Date:', selectedDate);
      setOrdersData(data);
      setToastMessage('Sifarişlər uğurla yükləndi');
      setShowSuccessToast(true);
    } catch (error: any) {
      const errorMessage = error?.message || 'Sifarişləri yükləyərkən xəta baş verdi';

      // Network error detection
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
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadOrders();
    setRefreshing(false);
  }, [selectedDate]);

  useEffect(() => {
    setLoading(true);
    loadOrders().finally(() => setLoading(false));
  }, [selectedDate]);

  if (loading) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <ThemedView style={{ padding: 16 }}>
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

      <RNScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        scrollEventThrottle={16}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: MIN_SHEET_HEIGHT + insets.bottom
        }}
        scrollEnabled={!isExpanded}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? PastryColors.vanilla : PastryColors.chocolate}
            colors={[PastryColors.chocolate]}
            progressBackgroundColor={isDark ? '#fff' : '#fff'}
            progressViewOffset={20} // Add some offset for better visibility
          />
        }
      >

        <ModernOrdersSummaryTable
          ordersData={ordersData}
          selectedDate={selectedDate}
          onDataChange={loadOrders}
        />
      </RNScrollView>

      <Animated.View style={[{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isDark ? PastryColors.chocolate : PastryColors.vanilla,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: insets.bottom,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }, animatedStyle]}>
        <TouchableOpacity
          onPress={toggleExpanded}
          style={{
            width: '100%',
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: 'transparent'
          }}
          activeOpacity={0.7}
        >
          <ThemedView style={{
            width: 40,
            height: 4,
            backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
            borderRadius: 2,
          }} />
          <Ionicons
            name={isExpanded ? "chevron-down" : "chevron-up"}
            size={20}
            color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
          />
        </TouchableOpacity>

        <ThemedView style={{ flex: 1 }}>
          <OrdersTotalSummary
            ordersData={ordersData}
            SHEET_HEIGHT={EXPANDED_HEIGHT}
            scrollRef={scrollRef}
          />
        </ThemedView>
      </Animated.View>
    </ThemedView>
  );
}