import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
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
const MIN_SHEET_HEIGHT = 200; // Increased to show header
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.8;

export function OrdersSummaryContent() {
  const [selectedDate, setSelectedDate] = useState(new Date('2025-01-02'));
  const [ordersData, setOrdersData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  
  // Animation values
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

  const animatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animation.value,
      [0, 1],
      [MIN_SHEET_HEIGHT, EXPANDED_HEIGHT],
      Extrapolate.CLAMP
    );

    return {
      height,
    };
  });

  useEffect(() => {
    loadOrders();
  }, [selectedDate]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrdersByDate(selectedDate);
      setOrdersData(data);
    } catch (error) {
      setError('Sifarişləri yükləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

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
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ 
          padding: 16,
          paddingBottom: MIN_SHEET_HEIGHT + insets.bottom
        }}
        scrollEnabled={!isExpanded}
      >
        <OrdersDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <OrdersSummaryTable ordersData={ordersData} />
      </ScrollView>

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