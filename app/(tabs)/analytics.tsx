import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, SafeAreaView, Dimensions, Platform, FlatList } from 'react-native';
import { TopBar } from '../../components/TopBar';
import { ThemedView } from '../../components/ThemedView';
import { useColorScheme } from '../../hooks/useColorScheme';
import { DateRangeSelector } from '../../components/analytics/DateRangeSelector';
import { ProductSelector } from '../../components/analytics/ProductSelector';
import { SalesChart } from '../../components/analytics/SalesChart';
import { AnalyticsStats } from '../../components/analytics/AnalyticsStats';
import { ChartHelper } from '../../components/analytics/ChartHelper';
import { PieChartComponent } from '../../components/analytics/PieChart';
import { PastryLoader } from '../../components/ui/PastryLoader';
import { useAnalyticsData } from '../../components/analytics/useAnalyticsData';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to last 30 days
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const {
    data: analyticsData,
    loading,
    error,
    availableProducts,
    refetch
  } = useAnalyticsData(startDate, endDate);

  // Update selected products when available products change
  useEffect(() => {
    if (availableProducts.length > 0 && selectedProducts.length === 0) {
      setSelectedProducts(availableProducts);
    }
  }, [availableProducts]);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleProductToggle = (productName: string) => {
    setSelectedProducts(prev => {
      const newSelection = prev.includes(productName)
        ? prev.filter(p => p !== productName)
        : [...prev, productName];
      
      setSelectAll(newSelection.length === availableProducts.length);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
      setSelectAll(false);
    } else {
      setSelectedProducts(availableProducts);
      setSelectAll(true);
    }
  };

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly') => {
    setSelectedPeriod(period);
  };

  const filteredChartData = useMemo(() => {
    if (!analyticsData) return null;
    
    return {
      ...analyticsData,
      productData: analyticsData.productData.filter((product: any) => 
        selectedProducts.includes(product.name)
      )
    };
  }, [analyticsData, selectedProducts]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <TopBar title="Analizlər" style={styles.topBar} />
          <ThemedView style={styles.loadingContainer}>
            <PastryLoader />
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const renderAnalyticsContent = () => {
    const components = [];
    
    // Date Range Selector
    components.push(
      <DateRangeSelector
        key="date-range"
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
      />
    );

    // Analytics Stats
    if (analyticsData) {
      components.push(
        <AnalyticsStats
          key="analytics-stats"
          data={analyticsData}
          selectedProducts={selectedProducts}
        />
      );
    }

    // Product Selector
    components.push(
      <ProductSelector
        key="product-selector"
        availableProducts={availableProducts}
        selectedProducts={selectedProducts}
        selectAll={selectAll}
        onProductToggle={handleProductToggle}
        onSelectAll={handleSelectAll}
      />
    );

    // Sales Chart
    if (filteredChartData && filteredChartData.productData.length > 0) {
      components.push(
        <SalesChart
          key="sales-chart"
          data={filteredChartData}
          startDate={startDate}
          endDate={endDate}
          selectedProducts={selectedProducts}
          onPeriodChange={handlePeriodChange}
        />
      );
    }

    // Chart Helper
    if (filteredChartData && filteredChartData.productData.length > 0) {
      components.push(
        <ChartHelper
          key="chart-helper"
          selectedPeriod={selectedPeriod}
        />
      );
    }

    // Pie Chart
    if (filteredChartData && filteredChartData.productData.length > 0) {
      components.push(
        <PieChartComponent
          key="pie-chart"
          data={filteredChartData}
          selectedProducts={selectedProducts}
        />
      );
    }

    return components;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <TopBar title="Analizlər" style={styles.topBar} />
        
        <FlatList
          data={renderAnalyticsContent()}
          keyExtractor={(item) => item.key || 'unknown'}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          renderItem={({ item }) => (
            <ThemedView style={styles.content}>
              {item}
            </ThemedView>
          )}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: screenWidth * 0.06,
    paddingTop: Platform.OS === 'ios' ? 12 : 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: screenHeight * 0.1,
  },
  content: {
    flex: 1,
    padding: screenWidth * 0.04,
    gap: screenHeight * 0.02,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 