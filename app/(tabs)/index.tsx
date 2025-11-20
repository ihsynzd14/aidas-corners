import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ShoppingCart,
  Package,
  Bell,
  Sparkles,
  Bot,
  Truck,
  Monitor,
  RefreshCw,
  TrendingDown,
  Minus,
} from 'lucide-react-native';
import { styles } from '@/components/ui/styles/index.styles';
import BottomNavigationBar from '@/components/navigation/BottomNavigationBar';
import { StatCard } from '@/components/cards/StatCard';
import { QuickActionCard } from '@/components/cards/QuickActionCard';
import { StatisticsCard } from '@/components/cards/StatisticsCard';
import { ManagementCard } from '@/components/cards/ManagementCard';
import { colorScheme } from '@/constants/colorScheme';
import useDailyOrderComparison from '@/hooks/useDailyOrderComparison';

export default function HomeScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dailyComparison = useDailyOrderComparison();
  const { width: SCREEN_WIDTH } = Dimensions.get('window');

  // Determine colors based on theme
  const theme = {
    background: isDarkMode ? colorScheme.backgroundDark : colorScheme.backgroundLight,
    card: isDarkMode ? colorScheme.cardDark : colorScheme.cardLight,
    text: isDarkMode ? colorScheme.textDark : colorScheme.textLight,
    textSubtle: isDarkMode ? colorScheme.textSubtleDark : colorScheme.textSubtleLight,
    shadow: isDarkMode
      ? '8px 8px 16px rgba(0, 0, 0, 0.3), -8px -8px 16px rgba(61, 58, 56, 0.5)'
      : '8px 8px 16px rgba(217, 166, 163, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.7)',
  };


  return (
    <View style={[styles.container, { backgroundColor: theme.background, flex: 1 }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: 12 }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.greeting, { color: theme.text }]}>
                Salam, Aidas Corners!
              </Text>
              <TouchableOpacity
                style={[
                  styles.insightBadge,
                  {
                    backgroundColor: dailyComparison.messageParts.color === 'green'
                      ? '#5D9C5910'  // Green background with opacity
                      : dailyComparison.messageParts.color === 'red'
                        ? '#FF6B6B10'  // Red background with opacity
                        : '#5D9C5910', // Default green background
                    minWidth: 305,
                    maxWidth: SCREEN_WIDTH - 60
                  }
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  dailyComparison.refresh();
                }}
                disabled={dailyComparison.isLoading}
              >
                {dailyComparison.messageParts.color === 'green' ? (
                  <Sparkles size={16} color={colorScheme.accentGreen} />
                ) : dailyComparison.messageParts.color === 'red' ? (
                  <TrendingDown size={16} color={colorScheme.accentRed} />
                ) : (
                  <Minus size={16} color={colorScheme.accentGreen} />
                )}
                <Text
                  style={[styles.insightText, {
                    flex: 1,
                    color: dailyComparison.messageParts.color === 'green'
                      ? colorScheme.accentGreen
                      : dailyComparison.messageParts.color === 'red'
                        ? colorScheme.accentRed
                        : colorScheme.accentGreen,
                    fontWeight: '600'
                  }]}
                  numberOfLines={1}
                >
                  {dailyComparison.isLoading ? 'Yüklənir...' : dailyComparison.error || dailyComparison.message}
                </Text>
                {dailyComparison.isLoading && (
                  <RefreshCw size={14} color={colorScheme.accentGreen} style={{ marginLeft: 8 }} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.notificationButton, { backgroundColor: theme.card }]}
              onPress={() => {
                router.push('/notification_history');
              }}
            >
              <Bell size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content - Fixed Size, No Scroll */}
        <View style={styles.mainContent}>
          {/* Top Stats Cards */}
          <View style={styles.statsRow}>
            <StatCard
              title="Yeni Sifarişlər"
              subtitle="Məhsulları əlavə et"
              icon={ShoppingCart}
              color={colorScheme.primary}
              onPress={() => {
                router.push('/(tabs)/new_orders');
              }}
              isDarkMode={isDarkMode}
              theme={theme}
            />
            <StatCard
              title="Stoklar və Hazırlıq"
              subtitle="Sifarişləri idarə et"
              icon={Package}
              color={colorScheme.accentRed}
              onPress={() => {
                router.push('/(tabs)/orders_summary');
              }}
              isDarkMode={isDarkMode}
              theme={theme}
            />
          </View>

          {/* Statistics Card - Expanded */}
          <StatisticsCard 
            isDarkMode={isDarkMode}
            theme={theme}
            colors={colorScheme}
          />

          {/* Quick Actions */}
          <View style={styles.quickActionsRow}>
            <QuickActionCard
              title="AI Asistan"
              icon={Bot}
              onPress={() => {
                router.push('/(tabs)/ai_assistant');
              }}
              isDarkMode={isDarkMode}
              theme={theme}
              primaryColor={colorScheme.primary}
            />
            <QuickActionCard
              title="Ərzaq Təqibi"
              icon={Truck}
              onPress={() => {
                router.push('/pages/daily-needs');
              }}
              isDarkMode={isDarkMode}
              theme={theme}
              primaryColor={colorScheme.primary}
            />
            <QuickActionCard
              title="Analizlər"
              icon={Monitor}
              onPress={() => {
                router.push('/(tabs)/analytics');
              }}
              isDarkMode={isDarkMode}
              theme={theme}
              primaryColor={colorScheme.primary}
            />
          </View>

          {/* Management Card */}
          <ManagementCard
            onPress={() => {
              router.push('/(tabs)/product_statistics');
            }}
            isDarkMode={isDarkMode}
            theme={theme}
            primaryColor={colorScheme.primary}
          />
        </View>
      </View>
    
      {/* Bottom Navigation */}
      <BottomNavigationBar isDarkMode={isDarkMode} />
    </View>
  );
}