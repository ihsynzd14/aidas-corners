import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors, PastryColors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnalyticsData } from './useAnalyticsData';

const { width: screenWidth } = Dimensions.get('window');

interface SalesChartProps {
  data: AnalyticsData;
  startDate: Date;
  endDate: Date;
  selectedProducts?: string[];
  onPeriodChange?: (period: 'daily' | 'weekly' | 'monthly') => void;
}

export function SalesChart({ data, startDate, endDate, selectedProducts, onPeriodChange }: SalesChartProps) {
  const isDark = useColorScheme() === 'dark';
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const chartData = useMemo(() => {
    if (!data.productData.length) return null;

    // Get all unique dates from the data
    const allDates = data.productData[0]?.data.map((point: any) => point.date) || [];
    
    // Process data based on selected period
    let processedDates: string[];
    let processedData: { [productName: string]: number[] };

    if (selectedPeriod === 'daily') {
      processedDates = allDates;
      processedData = {};
      
      data.productData.forEach((product: any) => {
        processedData[product.name] = product.data.map((point: any) => point.quantity);
      });
    } else if (selectedPeriod === 'weekly') {
      // Group by weeks
      const weeklyData: { [week: string]: { [product: string]: number } } = {};
      
      allDates.forEach((date: string, index: number) => {
        const dateObj = parseDate(date);
        const weekStart = getWeekStart(dateObj);
        const weekKey = formatDate(weekStart);
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {};
        }
        
        data.productData.forEach((product: any) => {
          if (!weeklyData[weekKey][product.name]) {
            weeklyData[weekKey][product.name] = 0;
          }
          weeklyData[weekKey][product.name] += product.data[index]?.quantity || 0;
        });
      });
      
      processedDates = Object.keys(weeklyData).sort();
      processedData = {};
      
      data.productData.forEach((product: any) => {
        processedData[product.name] = processedDates.map((week: string) => 
          weeklyData[week][product.name] || 0
        );
      });
    } else {
      // Group by months
      const monthlyData: { [month: string]: { [product: string]: number } } = {};
      
      allDates.forEach((date: string, index: number) => {
        const dateObj = parseDate(date);
        const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {};
        }
        
        data.productData.forEach((product: any) => {
          if (!monthlyData[monthKey][product.name]) {
            monthlyData[monthKey][product.name] = 0;
          }
          monthlyData[monthKey][product.name] += product.data[index]?.quantity || 0;
        });
      });
      
      processedDates = Object.keys(monthlyData).sort();
      processedData = {};
      
      data.productData.forEach(product => {
        processedData[product.name] = processedDates.map(month => 
          monthlyData[month][product.name] || 0
        );
      });
    }

    // Format labels for display
    const labels = processedDates.map((date, index) => {
      if (selectedPeriod === 'daily') {
        const parts = date.split('.');
        return `${parts[0]}/${parts[1]}`;
      } else if (selectedPeriod === 'weekly') {
        return `H${index + 1}`;
      } else {
        const [year, month] = date.split('-');
        return `${month}/${year.slice(2)}`;
      }
    });

    // Create datasets for each product
    const datasets = data.productData.map(product => ({
      data: processedData[product.name],
      color: () => product.color,
      strokeWidth: 2,
    }));

    return {
      labels: labels.length > 10 ? 
        labels.filter((_, index) => index % Math.ceil(labels.length / 10) === 0) : 
        labels,
      datasets
    };
  }, [data, selectedPeriod]);

  const handleDataPointClick = (clickData: any) => {
    console.log('Data point clicked:', clickData);
    
    if (clickData && typeof clickData.index !== 'undefined' && typeof clickData.datasetIndex !== 'undefined') {
      const pointIndex = clickData.index;
      const datasetIndex = clickData.datasetIndex;
      
      if (data.productData[datasetIndex] && chartData) {
        const product = data.productData[datasetIndex];
        const dateLabel = chartData.labels[pointIndex];
        const value = chartData.datasets[datasetIndex].data[pointIndex];
        
        Alert.alert(
          'Satış Məlumatı',
          `Məhsul: ${product.name}\nTarix: ${dateLabel}\nSatış: ${value} ədəd`,
          [{ text: 'Bağla', style: 'default' }]
        );
      }
    }
  };

  const chartConfig = {
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    backgroundGradientFrom: isDark ? '#1a1a1a' : '#ffffff',
    backgroundGradientTo: isDark ? '#2a2a2a' : '#f8f8f8',
    decimalPlaces: 0,
    color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(74, 53, 49, ${opacity})`,
    labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity * 0.8})` : `rgba(74, 53, 49, ${opacity * 0.8})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(74, 53, 49, 0.1)',
      strokeWidth: 1,
    },
  };

  if (!chartData) {
    return (
      <ThemedView style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }
      ]}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="chart-line"
            size={48}
            color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(74,53,49,0.3)'}
          />
          <ThemedText style={[
            styles.emptyText,
            { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)' }
          ]}>
            Göstərmək üçün məhsul seçin
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[
      styles.container,
      {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      }
    ]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons
            name="chart-line"
            size={20}
            color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
          />
          <ThemedText style={[
            styles.title,
            { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
          ]}>
            Satış Trendi
          </ThemedText>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['daily', 'weekly', 'monthly'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                {
                  backgroundColor: selectedPeriod === period
                    ? (isDark ? PastryColors.primary : PastryColors.primary)
                    : 'transparent',
                  borderColor: isDark ? PastryColors.primary : PastryColors.primary,
                }
              ]}
                             onPress={() => {
                 setSelectedPeriod(period);
                 onPeriodChange?.(period);
               }}
            >
              <ThemedText style={[
                styles.periodText,
                {
                  color: selectedPeriod === period
                    ? 'white'
                    : (isDark ? PastryColors.primary : PastryColors.primary)
                }
              ]}>
                {period === 'daily' ? 'Günlük' : period === 'weekly' ? 'Həftəlik' : 'Aylıq'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chart */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: chartData.labels,
              datasets: chartData.datasets
            }}
            width={Math.max(screenWidth - 32, chartData.labels.length * 60)}
            height={280}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={true}
            withHorizontalLines={true}
            withDots={true}
            withShadow={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            onDataPointClick={handleDataPointClick}
          />
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <ThemedText style={[
          styles.legendTitle,
          { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
        ]}>
          Məhsullar:
        </ThemedText>
        <View style={styles.legend}>
          {data.productData.map((product, index) => (
            <View key={product.name} style={styles.legendItem}>
              <View style={[
                styles.legendColor,
                { backgroundColor: product.color }
              ]} />
              <ThemedText style={[
                styles.legendText,
                { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
              ]} numberOfLines={2}>
                {product.name}
              </ThemedText>
              <ThemedText style={[
                styles.legendValue,
                { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)' }
              ]}>
                {product.totalQuantity}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>


    </ThemedView>
  );
}

// Helper functions
function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('.').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  periodText: {
    fontSize: 11,
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  legendContainer: {
    marginTop: 16,
    gap: 8,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: screenWidth * 0.25,
    maxWidth: screenWidth * 0.4,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    lineHeight: 14,
  },
  legendValue: {
    fontSize: 10,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
 