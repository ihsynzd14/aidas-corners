import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, useColorScheme, Text, Animated, LayoutAnimation, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { TopBar } from '@/components/TopBar';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { DatePicker } from '@/components/statistics/DatePicker';
import { ViewSwitcher } from '@/components/statistics/ViewSwitcher';
import { SummaryView } from '@/components/statistics/SummaryView';
import { DailyView } from '@/components/statistics/DailyView';
import { ProductSelectionBottomSheet } from '@/components/statistics/ProductSelectionBottomSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ProductStats, DailyStats } from './ProductStatisticsLogic';

interface ExportButtonsProps {
  onExcelPress: () => void;
  onWhatsAppPress: () => void;
  onCopyPress: () => void;
  startDate: Date;
  endDate: Date;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExcelPress,
  onWhatsAppPress,
  onCopyPress,
  startDate,
  endDate
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const bgColor = isDark ? '#1F2937' : '#FFFFFF';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const textColor = isDark ? '#E5E7EB' : '#374151';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View style={[styles.exportWrapper, { borderColor, backgroundColor: bgColor }]}>
      <TouchableOpacity 
        style={styles.headerSection} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <MaterialIcons 
            name="ios-share" 
            size={22} 
            color={textColor}
            style={styles.shareIcon}
          />
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Paylaş
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <Text style={[styles.dateText, { color: secondaryTextColor }]}>
            {formatDate(startDate)} - {formatDate(endDate)}
          </Text>
          <MaterialIcons 
            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={24} 
            color={secondaryTextColor}
            style={styles.arrowIcon}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={[styles.buttonGroup, { borderTopColor: borderColor }]}>
          <TouchableOpacity 
            style={[
              styles.exportButton, 
              styles.outlineButton,
              { backgroundColor: bgColor, borderColor }
            ]} 
            onPress={onExcelPress}
          >
            <View style={styles.buttonContent}>
              <MaterialIcons name="table-chart" size={20} color="#10B981" />
              <Text style={[styles.buttonText, { color: "#10B981" }]}>Excel</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.exportButton, styles.whatsappButton]} 
            onPress={onWhatsAppPress}
          >
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="whatsapp" size={20} color="#FFFFFF" />
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>WhatsApp</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.exportButton, 
              styles.outlineButton,
              { backgroundColor: bgColor, borderColor }
            ]} 
            onPress={onCopyPress}
          >
            <View style={styles.buttonContent}>
              <MaterialIcons name="content-copy" size={20} color={textColor} />
              <Text style={[styles.buttonText, { color: textColor }]}>Kopyala</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

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
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  onStartDateChange: (event: any, selectedDate?: Date) => void;
  onEndDateChange: (event: any, selectedDate?: Date) => void;
  setShowStartPicker: (show: boolean) => void;
  setShowEndPicker: (show: boolean) => void;
  setViewMode: (mode: 'summary' | 'daily') => void;
  setSelectedProduct: (product: string) => void;
  setSelectedBranch: (branch: string) => void;
  setAvailableBranches: (branches: string[]) => void;
  handlePresentModalPress: () => void;
  generateExcel: () => void;
  generateWhatsAppText: () => void;
  copyToClipboard: () => void;
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
  bottomSheetModalRef,
  onStartDateChange,
  onEndDateChange,
  setShowStartPicker,
  setShowEndPicker,
  setViewMode,
  setSelectedProduct,
  setSelectedBranch,
  setAvailableBranches,
  handlePresentModalPress,
  generateExcel,
  generateWhatsAppText,
  copyToClipboard
}) => {
  return (
    <ThemedView style={styles.container}>
      <TopBar 
        title="Məhsul Statistikası" 
        style={styles.topBar}
      />
      
      <ViewSwitcher 
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <DatePicker
        startDate={startDate}
        endDate={endDate}
        showStartPicker={showStartPicker}
        showEndPicker={showEndPicker}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        setShowStartPicker={setShowStartPicker}
        setShowEndPicker={setShowEndPicker}
      />

      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </ThemedView>
      ) : (
        viewMode === 'summary' ? (
          <>
            <ExportButtons
              onExcelPress={generateExcel}
              onWhatsAppPress={generateWhatsAppText}
              onCopyPress={copyToClipboard}
              startDate={startDate}
              endDate={endDate}
            />
            <SummaryView productStats={productStats} />
          </>
        ) : (
          <DailyView
            selectedProduct={selectedProduct}
            selectedBranch={selectedBranch}
            dailyStats={dailyStats}
            onSelectionPress={handlePresentModalPress}
          />
        )
      )}

      <ProductSelectionBottomSheet
        bottomSheetModalRef={bottomSheetModalRef}
        selectedProduct={selectedProduct}
        selectedBranch={selectedBranch}
        productStats={productStats}
        availableBranches={availableBranches}
        setSelectedProduct={setSelectedProduct}
        setSelectedBranch={setSelectedBranch}
        setAvailableBranches={setAvailableBranches}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  exportWrapper: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareIcon: {
    marginRight: 8,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    padding: 14,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  exportButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
  },
  outlineButton: {
    borderWidth: 1,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
}); 