import React from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, useColorScheme as useNativeColorScheme, Text, View, Platform, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { DatePicker } from '@/components/statistics/DatePicker';
import { DateRangePickerModal } from '@/components/statistics/DateRangePickerModal';
import { ViewSwitcher } from '@/components/statistics/ViewSwitcher';
import { SummaryView } from '@/components/statistics/SummaryView';
import { DailyView } from '@/components/statistics/DailyView';
import { ProductSelectionBottomSheet } from '@/components/statistics/ProductSelectionBottomSheet';
import { ShareBottomSheet } from '@/components/statistics/ShareBottomSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ProductStats, DailyStats } from './ProductStatisticsLogic';
import { useRouter } from 'expo-router';
import { colorScheme } from '@/constants/colorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProductStatisticsUIProps {
  loading: boolean;
  productStats: ProductStats[];
  startDate: Date;
  endDate: Date;
  showStartPicker: boolean;
  showEndPicker: boolean;
  viewMode: 'summary' | 'daily';
  selectedProduct: string;
  selectedBranch: string;
  dailyStats: DailyStats[];
  availableBranches: string[];
  totalEarnings: number;
  dateRangeModalRef: React.RefObject<BottomSheetModal | null>;
  productSelectionVisible: boolean;
  setProductSelectionVisible: (visible: boolean) => void;
  onStartDateChange: (event: any, selectedDate?: Date) => void;
  onEndDateChange: (event: any, selectedDate?: Date) => void;
  onDateRangeConfirm: (start: Date, end: Date) => void;
  setShowStartPicker: (show: boolean) => void;
  setShowEndPicker: (show: boolean) => void;
  setViewMode: (mode: 'summary' | 'daily') => void;
  setSelectedProduct: (product: string) => void;
  setSelectedBranch: (branch: string) => void;
  setAvailableBranches: (branches: string[]) => void;
  generateExcel: () => void;
  generateWhatsAppText: () => void;
  copyToClipboard: () => void;
  shareVisible: boolean;
  setShareVisible: (visible: boolean) => void;
}

export const ProductStatisticsUI: React.FC<ProductStatisticsUIProps> = ({
  loading,
  productStats,
  startDate,
  endDate,
  showStartPicker,
  showEndPicker,
  viewMode,
  selectedProduct,
  selectedBranch,
  dailyStats,
  availableBranches,
  totalEarnings,
  dateRangeModalRef,
  productSelectionVisible,
  setProductSelectionVisible,
  onStartDateChange,
  onEndDateChange,
  onDateRangeConfirm,
  setShowStartPicker,
  setShowEndPicker,
  setViewMode,
  setSelectedProduct,
  setSelectedBranch,
  setAvailableBranches,
  generateExcel,
  generateWhatsAppText,
  copyToClipboard,
  shareVisible,
  setShareVisible
}) => {
  const router = useRouter();
  const nativeColorScheme = useNativeColorScheme();
  const isDark = nativeColorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const handleSharePress = () => {
    setShareVisible(true);
  };

  const bgColor = isDark ? colorScheme.backgroundDark : colorScheme.backgroundLight;
  const headerBgColor = isDark ? 'rgba(44, 42, 41, 0.8)' : 'rgba(253, 247, 243, 0.8)'; // slightly transparent version of background
  const borderColor = isDark ? colorScheme.cardDark : colorScheme.cardLight; // Using card colors for borders as per scheme
  const textColor = isDark ? colorScheme.textDark : colorScheme.textLight;

  const totalSold = React.useMemo(() => {
    return productStats.reduce((acc, curr) => acc + curr.totalQuantity, 0);
  }, [productStats]);

  const topProduct = React.useMemo(() => {
    if (productStats.length === 0) return '-';
    const sorted = [...productStats].sort((a, b) => b.totalQuantity - a.totalQuantity);
    return sorted[0].productName;
  }, [productStats]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={{ backgroundColor: headerBgColor, paddingTop: insets.top }}>
        <View style={[
          styles.header,
          {
            borderBottomColor: isDark ? 'rgba(82, 42, 50, 0.5)' : 'rgba(231, 208, 212, 0.5)', // specific border colors from HTML logic but mapped to our scheme if possible, or kept close
            backgroundColor: headerBgColor
          }
        ]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: textColor }]}>Məhsul Statistikası</Text>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSharePress}
          >
            <MaterialIcons name="ios-share" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Tabs (Umumi / Tek Filial) */}
      <View style={[
        styles.navTabs,
        {
          backgroundColor: bgColor,
          borderBottomColor: borderColor
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.navTab,
            viewMode === 'summary' && { borderBottomColor: colorScheme.primary }
          ]}
          onPress={() => setViewMode('summary')}
        >
          <Text style={[
            styles.navTabText,
            { color: viewMode === 'summary' ? textColor : (isDark ? colorScheme.textSubtleDark : colorScheme.textSubtleLight) }
          ]}>
            Ümumi Baxış
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navTab,
            viewMode === 'daily' && { borderBottomColor: colorScheme.primary }
          ]}
          onPress={() => setViewMode('daily')}
        >
          <Text style={[
            styles.navTabText,
            { color: viewMode === 'daily' ? textColor : (isDark ? colorScheme.textSubtleDark : colorScheme.textSubtleLight) }
          ]}>
            Tək Filial Baxış
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <DatePicker
          startDate={startDate}
          endDate={endDate}
          onPress={() => dateRangeModalRef.current?.present()}
        />

        <View style={styles.statsGrid}>
          <View style={[
            styles.statCard,
            styles.statCardModern,
            {
              backgroundColor: isDark ? colorScheme.cardDark : colorScheme.cardLight,
              borderColor: isDark ? colorScheme.borderRed : colorScheme.borderRed,
            }
          ]}>
            <View style={styles.statCardHeader}>
              <View style={[
                styles.iconCircleModern,
                { backgroundColor: isDark ? 'rgba(255, 107, 107, 0.15)' : 'rgba(255, 107, 107, 0.12)' }
              ]}>
                <MaterialIcons name="bar-chart" size={22} color="#FF6B6B" />
              </View>
            </View>
            <View style={styles.statCardFooter}>
              <Text style={[
                styles.statLabelModern,
                { color: isDark ? colorScheme.textSubtleDark : colorScheme.textSubtleLight }
              ]}>Ümumi Məhsul</Text>
              <Text style={[styles.statValueModern, { color: textColor }]} numberOfLines={1}>
                {totalSold.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={[
            styles.statCard,
            styles.statCardModern,
            {
              backgroundColor: isDark ? colorScheme.cardDark : colorScheme.cardLight,
              borderColor: isDark ? colorScheme.borderRed : colorScheme.borderRed,
            }
          ]}>
            <View style={styles.statCardHeader}>
              <View style={[
                styles.iconCircleModern,
                { backgroundColor: isDark ? 'rgba(78, 205, 196, 0.15)' : 'rgba(78, 205, 196, 0.12)' }
              ]}>
                <MaterialIcons name="trending-up" size={22} color="#4ECDC4" />
              </View>
            </View>
            <View style={styles.statCardFooter}>
              <Text style={[
                styles.statLabelModern,
                { color: isDark ? colorScheme.textSubtleDark : colorScheme.textSubtleLight }
              ]}>Ən Çox Satılan</Text>
              <Text style={[styles.statValueModern, { color: textColor }]} numberOfLines={1}>
                {topProduct}
              </Text>
            </View>
          </View>

          <View style={[
            styles.statCard,
            styles.statCardModern,
            {
              backgroundColor: isDark ? colorScheme.cardDark : colorScheme.cardLight,
              borderColor: isDark ? colorScheme.borderRed : colorScheme.borderRed,
            }
          ]}>
            <View style={styles.statCardHeader}>
              <View style={[
                styles.iconCircleModern,
                { backgroundColor: isDark ? 'rgba(255, 195, 0, 0.15)' : 'rgba(255, 195, 0, 0.12)' }
              ]}>
                <MaterialIcons name="payments" size={22} color="#FFC300" />
              </View>
            </View>
            <View style={styles.statCardFooter}>
              <Text style={[
                styles.statLabelModern,
                { color: isDark ? colorScheme.textSubtleDark : colorScheme.textSubtleLight }
              ]}>Ümumi Qazanc</Text>
              <Text style={[styles.statValueModern, { color: textColor }]} numberOfLines={1}>
                {totalEarnings.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₼
              </Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colorScheme.primary} />
          </View>
        ) : (
          viewMode === 'summary' ? (
            <SummaryView productStats={productStats} />
          ) : (
            <DailyView
              selectedProduct={selectedProduct}
              selectedBranch={selectedBranch}
              dailyStats={dailyStats}
              onSelectionPress={() => setProductSelectionVisible(true)}
            />
          )
        )}
      </View>

      <ProductSelectionBottomSheet
        visible={productSelectionVisible}
        selectedProduct={selectedProduct}
        selectedBranch={selectedBranch}
        productStats={productStats}
        availableBranches={availableBranches}
        setSelectedProduct={setSelectedProduct}
        setSelectedBranch={setSelectedBranch}
        setAvailableBranches={setAvailableBranches}
        onClose={() => setProductSelectionVisible(false)}
      />

      <DateRangePickerModal
        bottomSheetRef={dateRangeModalRef as React.RefObject<BottomSheetModal>}
        startDate={startDate}
        endDate={endDate}
        onConfirm={onDateRangeConfirm}
      />

      <ShareBottomSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        onExcelPress={generateExcel}
        onWhatsAppPress={generateWhatsAppText}
        onCopyPress={copyToClipboard}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56, // h-16 in tailwind is 64px usually, but h-16 is 4rem = 64px. HTML says h-16. Let's check tailwind. h-16 is 4rem. 1rem = 16px usually. So 64px.
    // Wait, HTML says h-16. 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, // px-4
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 48, // w-12
    height: 48, // h-12
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18, // text-lg
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  navTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16, // px-4
    borderBottomWidth: 1,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14, // py-3.5
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  navTabText: {
    fontSize: 14, // text-sm
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16, // p-4
    // gap: 16, // Add gap between elements
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12, // rounded-lg
    borderWidth: 1,
    gap: 6, // gap-1.5
  },
  statCardModern: {
    padding: 0,
    overflow: 'hidden',
    gap: 0,
  },
  statCardHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  statCardFooter: {
    padding: 16,
    paddingTop: 12,
  },
  statCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCircleModern: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
  },
  statLabelModern: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20, // text-xl
    fontWeight: 'bold', // font-bold
    letterSpacing: -0.5, // tracking-tight
  },
  statValueModern: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
