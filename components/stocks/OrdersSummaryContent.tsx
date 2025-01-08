import React, { useState, useEffect, useRef } from 'react';
import { 
  ActivityIndicator, 
  Dimensions, 
  TouchableOpacity, 
  RefreshControl,
  ScrollView as RNScrollView // Using native ScrollView
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { OrdersDatePicker } from './OrdersDatePicker';
import { OrdersSummaryTable } from './OrdersSummaryTable';
import { OrdersTotalSummary } from './OrdersTotalSummary';
import { fetchOrdersByDate } from '@/utils/ordersData';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, PastryColors } from '@/constants/Colors';
import { ThemedText } from '../ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { PastryLoader } from '../ui/PastryLoader';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MIN_SHEET_HEIGHT = 250;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.8;

export function OrdersSummaryContent() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [ordersData, setOrdersData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  
  const animation = useSharedValue(0);

  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
    animation.value = withSpring(isExpanded ? 0 : 1, {
      damping: 15,
      stiffness: 100,
      mass: 0.8,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      animation.value,
      [0, 1],
      [MIN_SHEET_HEIGHT, EXPANDED_HEIGHT],
      Extrapolate.CLAMP
    ),
  }));

  const loadOrders = async () => {
    try {
      const data = await fetchOrdersByDate(selectedDate);
      setOrdersData(data);
      setError(null);
    } catch (error) {
      setError('Sifarişləri yükləyərkən xəta baş verdi');
      console.error('Error loading orders:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await loadOrders();
    } finally {
      setRefreshing(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    setLoading(true);
    loadOrders().finally(() => setLoading(false));
  }, [selectedDate]);

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <PastryLoader />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ThemedText style={{ color: Colors.danger, textAlign: 'center' }}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
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
        <OrdersDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <OrdersSummaryTable 
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