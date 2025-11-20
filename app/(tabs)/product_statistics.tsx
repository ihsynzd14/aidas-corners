import React, { useCallback, useRef } from 'react';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ProductStatisticsUI } from '@/components/statistics/ProductStatisticsUI';
import { useProductStatistics } from '@/components/statistics/ProductStatisticsLogic';


export default function ProductStatisticsScreen() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const dateRangeModalRef = useRef<BottomSheetModal>(null);
  const [shareVisible, setShareVisible] = React.useState(false);

  const {
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
    setStartDate,
    setEndDate,
    setShowStartPicker,
    setShowEndPicker,
    setViewMode,
    setSelectedProduct,
    setSelectedBranch,
    setAvailableBranches,
    fetchData,
    fetchDailyStats,
    generateExcel,
    generateWhatsAppText,
    copyToClipboard,
    onDateRangeConfirm
  } = useProductStatistics();

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  React.useEffect(() => {
    if (viewMode === 'summary') {
      fetchData();
    } else if (viewMode === 'daily') {
      fetchDailyStats();
    }
  }, [viewMode, fetchData, fetchDailyStats]);

  return (
    <BottomSheetModalProvider>
      <ProductStatisticsUI
        loading={loading}
          productStats={productStats}
          startDate={startDate}
          endDate={endDate}
          showStartPicker={showStartPicker}
          showEndPicker={showEndPicker}
          viewMode={viewMode}
          selectedProduct={selectedProduct}
          selectedBranch={selectedBranch}
          dailyStats={dailyStats}
          availableBranches={availableBranches}
          bottomSheetModalRef={bottomSheetModalRef}
          dateRangeModalRef={dateRangeModalRef}
          shareVisible={shareVisible}
          setShareVisible={setShareVisible}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
          onDateRangeConfirm={onDateRangeConfirm}
          setShowStartPicker={setShowStartPicker}
          setShowEndPicker={setShowEndPicker}
          setViewMode={setViewMode}
          setSelectedProduct={setSelectedProduct}
          setSelectedBranch={setSelectedBranch}
          setAvailableBranches={setAvailableBranches}
          handlePresentModalPress={handlePresentModalPress}
          generateExcel={generateExcel}
          generateWhatsAppText={generateWhatsAppText}
          copyToClipboard={copyToClipboard}
        />
    </BottomSheetModalProvider>
  );
}