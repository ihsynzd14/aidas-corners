import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { TopBar } from '@/components/TopBar';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { formatDate } from '@/utils/firebase';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DatePicker } from '@/components/statistics/DatePicker';
import { ViewSwitcher } from '@/components/statistics/ViewSwitcher';
import { SummaryView } from '@/components/statistics/SummaryView';
import { DailyView } from '@/components/statistics/DailyView';
import { ProductSelectionBottomSheet } from '@/components/statistics/ProductSelectionBottomSheet';

interface ProductStats {
  productName: string;
  branchStats: {
    [key: string]: {
      quantity: number;
      dates: { [date: string]: number };
    };
  };
  totalQuantity: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface DailyStats {
  date: string;
  quantity: number;
}

export default function ProductStatisticsScreen() {
  const [loading, setLoading] = useState(true);
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'daily'>('summary');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

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

  const getDatesInRange = (start: Date, end: Date) => {
    const dates = [];
    const current = new Date(start);
    const endTime = new Date(end);

    while (current <= endTime) {
      dates.push(formatDate(new Date(current)));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data for date range:', {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      });
      
      const db = getFirestore();
      const stats: { [key: string]: ProductStats } = {};
      
      const dates = getDatesInRange(startDate, endDate);
      console.log('Processing dates:', dates);

      for (const date of dates) {
        const ordersRef = collection(db, 'orders', date, 'branches');
        const branchesSnapshot = await getDocs(ordersRef);
        console.log(`Processing data for date ${date}:`, {
          numberOfBranches: branchesSnapshot.size
        });

        branchesSnapshot.forEach((branchDoc) => {
          const branchData = branchDoc.data();
          const branchName = branchDoc.id;
          console.log(`Branch data for ${branchName}:`, branchData);

          Object.entries(branchData).forEach(([product, quantity]) => {
            const normalizedProduct = product.trim();
            
            if (!stats[normalizedProduct]) {
              stats[normalizedProduct] = {
                productName: normalizedProduct,
                branchStats: {},
                totalQuantity: 0,
                dateRange: {
                  startDate: formatDate(startDate),
                  endDate: formatDate(endDate)
                }
              };
            }

            const numericQuantity = parseFloat(quantity as string);
            
            if (!stats[normalizedProduct].branchStats[branchName]) {
              stats[normalizedProduct].branchStats[branchName] = {
                quantity: 0,
                dates: {}
              };
            }

            stats[normalizedProduct].branchStats[branchName].quantity += numericQuantity;
            stats[normalizedProduct].branchStats[branchName].dates[date] = (stats[normalizedProduct].branchStats[branchName].dates[date] || 0) + numericQuantity;
            stats[normalizedProduct].totalQuantity += numericQuantity;
          });
        });
      }

      console.log('Final processed stats:', stats);
      setProductStats(Object.values(stats).sort((a, b) => b.totalQuantity - a.totalQuantity));
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchData:', error);
      setLoading(false);
    }
  };

  const fetchDailyStats = async () => {
    if (!selectedProduct || !selectedBranch) {
      console.log('No product or branch selected, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching daily stats for:', {
        product: selectedProduct,
        branch: selectedBranch,
        dateRange: {
          start: formatDate(startDate),
          end: formatDate(endDate)
        }
      });

      const dates = getDatesInRange(startDate, endDate);
      const dailyData: DailyStats[] = [];

      for (const date of dates) {
        const db = getFirestore();
        const branchRef = collection(db, 'orders', date, 'branches');
        const branchSnapshot = await getDocs(branchRef);
        
        branchSnapshot.forEach((doc) => {
          if (doc.id === selectedBranch) {
            const data = doc.data();
            console.log(`Data for date ${date}:`, data);
            const matchingProduct = Object.entries(data).find(([key]) => 
              key.trim() === selectedProduct.trim()
            );
            
            if (matchingProduct) {
              dailyData.push({
                date,
                quantity: parseFloat(matchingProduct[1] as string)
              });
            } else {
              dailyData.push({ date, quantity: 0 });
            }
          }
        });
      }

      console.log('Final daily stats:', dailyData);
      setDailyStats(dailyData);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchDailyStats:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'summary') {
      fetchData();
    } else if (viewMode === 'daily') {
      fetchDailyStats();
    }
  }, [startDate, endDate, viewMode, selectedProduct, selectedBranch]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
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
              <SummaryView productStats={productStats} />
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
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

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
}); 