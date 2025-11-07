import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors, PastryColors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnalyticsData } from './useAnalyticsData';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsStatsProps {
  data: AnalyticsData;
  selectedProducts: string[];
}

export function AnalyticsStats({ data, selectedProducts }: AnalyticsStatsProps) {
  const isDark = useColorScheme() === 'dark';

  const filteredStats = useMemo(() => {
    const filteredProductData = data.productData.filter((product: any) => 
      selectedProducts.includes(product.name)
    );

    const totalSales = filteredProductData.reduce((sum: number, product: any) => sum + product.totalQuantity, 0);
    const totalProducts = filteredProductData.length;
    
    // Calculate date range
    const startDate = new Date(data.dateRange.startDate.split('.').reverse().join('-'));
    const endDate = new Date(data.dateRange.endDate.split('.').reverse().join('-'));
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const averageDailySales = totalSales / daysDiff;

    // Find top selling product
    const topProduct = filteredProductData.reduce((top: any, product: any) => 
      product.totalQuantity > (top?.totalQuantity || 0) ? product : top, 
      filteredProductData[0]
    );

    return {
      totalSales,
      totalProducts,
      averageDailySales,
      topProduct,
      daysDiff
    };
  }, [data, selectedProducts]);

  const stats = [
    {
      icon: 'chart-box',
      label: 'Ümumi Satış',
      value: filteredStats.totalSales.toLocaleString(),
      unit: 'ədəd',
      color: '#FF6B6B'
    },
    {
      icon: 'package-variant',
      label: 'Məhsul Sayı',
      value: filteredStats.totalProducts.toString(),
      unit: 'növ',
      color: '#4ECDC4'
    },
    {
      icon: 'calendar-today',
      label: 'Günlük Orta',
      value: filteredStats.averageDailySales.toFixed(1),
      unit: 'ədəd/gün',
      color: '#FFD93D'
    },
    {
      icon: 'trophy',
      label: 'Ən Çox Satan',
      value: filteredStats.topProduct?.name || 'N/A',
      unit: `${filteredStats.topProduct?.totalQuantity || 0} ədəd`,
      color: '#95DAB6'
    }
  ];

  return (
    <ThemedView style={[
      styles.container,
      {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      }
    ]}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="chart-donut"
          size={20}
          color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
        />
        <ThemedText style={[
          styles.title,
          { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
        ]}>
          Statistika
        </ThemedText>
        <View style={[
          styles.badge,
          {
            backgroundColor: isDark ? PastryColors.primary : PastryColors.primary,
          }
        ]}>
          <ThemedText style={[
            styles.badgeText,
            { color: 'white' }
          ]}>
            {filteredStats.daysDiff} gün
          </ThemedText>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              }
            ]}
          >
            <View style={styles.statHeader}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: `${stat.color}20` }
              ]}>
                <MaterialCommunityIcons
                  name={stat.icon as any}
                  size={18}
                  color={stat.color}
                />
              </View>
              <ThemedText style={[
                styles.statLabel,
                { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(74,53,49,0.7)' }
              ]}>
                {stat.label}
              </ThemedText>
            </View>
            
            <View style={styles.statContent}>
              <ThemedText style={[
                styles.statValue,
                { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
              ]} numberOfLines={1}>
                {stat.value}
              </ThemedText>
              <ThemedText style={[
                styles.statUnit,
                { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)' }
              ]}>
                {stat.unit}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (screenWidth - 80) / 2,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  statContent: {
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statUnit: {
    fontSize: 11,
    fontWeight: '500',
  },
}); 