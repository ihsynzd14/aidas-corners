import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors, PastryColors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnalyticsData } from './useAnalyticsData';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PieChartComponentProps {
  data: AnalyticsData;
  selectedProducts: string[];
}

export function PieChartComponent({ data, selectedProducts }: PieChartComponentProps) {
  const isDark = useColorScheme() === 'dark';
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);
  const [showPercentages, setShowPercentages] = useState(true);
  const [hasLegend, setHasLegend] = useState(false);

  const pieData = useMemo(() => {
    const filteredProducts = data.productData.filter(product => 
      selectedProducts.includes(product.name)
    );

    const totalSales = filteredProducts.reduce((sum, product) => sum + product.totalQuantity, 0);

    if (totalSales === 0) return [];

    // Unique, very different colors for maximum distinction
    const enhancedColors = [
      '#FF0000', '#00FF00', '#00AEDD', '#FFFF00', '#FF00FF',
      '#00FFFF', '#FFA500', '#800080', '#008000', '#FF1493',
      '#32CD32', '#FF4500', '#9400D3', '#00CED1', '#FFD700',
      '#DC143C', '#00FA9A', '#1E90FF', '#FF69B4', '#8A2BE2',
      '#00FF7F', '#FF6347', '#4169E1', '#FF20B2', '#7FFF00'
    ];

    return filteredProducts
      .filter(product => product.totalQuantity > 0)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .map((product, index) => {
        const percentage = ((product.totalQuantity / totalSales) * 100);
        const shortName = product.name.length > 8 ? product.name.substring(0, 8) + '...' : product.name;
        return {
          name: shortName,
          fullName: product.name,
          population: product.totalQuantity,
          color: enhancedColors[index % enhancedColors.length] || product.color,
          legendFontColor: isDark ? PastryColors.vanilla : PastryColors.chocolate,
          legendFontSize: 11,
          percentage: percentage.toFixed(1)
        };
      });
  }, [data, selectedProducts, isDark]);

  const chartConfig = {
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    backgroundGradientFrom: isDark ? '#1a1a1a' : '#ffffff',
    backgroundGradientTo: isDark ? '#2a2a2a' : '#f8f8f8',
    decimalPlaces: 0,
    color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(74, 53, 49, ${opacity})`,
    labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity * 0.9})` : `rgba(74, 53, 49, ${opacity * 0.9})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: 'bold',
    },
  };

  const totalSales = pieData.reduce((sum, item) => sum + item.population, 0);

  if (pieData.length === 0) {
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
            name="chart-pie"
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
            name="chart-pie"
            size={20}
            color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
          />
          <ThemedText style={[
            styles.title,
            { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
          ]}>
            Satış Payları
          </ThemedText>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              {
                backgroundColor: showPercentages 
                  ? PastryColors.primary 
                  : 'transparent',
                borderColor: PastryColors.primary,
              }
            ]}
            onPress={() => setShowPercentages(!showPercentages)}
          >
            <MaterialCommunityIcons
              name="percent"
              size={14}
              color={showPercentages ? 'white' : PastryColors.primary}
            />
            <ThemedText style={[
              styles.toggleText,
              { 
                color: showPercentages ? 'white' : PastryColors.primary
              }
            ]}>
              %
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              {
                backgroundColor: hasLegend 
                  ? PastryColors.primary 
                  : 'transparent',
                borderColor: PastryColors.primary,
              }
            ]}
            onPress={() => setHasLegend(!hasLegend)}
          >
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={14}
              color={hasLegend ? 'white' : PastryColors.primary}
            />
            <ThemedText style={[
              styles.toggleText,
              { 
                color: hasLegend ? 'white' : PastryColors.primary
              }
            ]}>
              Etiket
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <PieChart
          data={pieData}
          width={screenWidth - 32}
          height={500}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="45"
          center={[60, 0]}
          absolute={!showPercentages}
          hasLegend={hasLegend}
          avoidFalseZero={true}
        />
      </View>

    

      {/* Custom Legend with FlatList */}
      <View style={styles.legendHeader}>
        <ThemedText style={[
          styles.legendTitle,
          { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
        ]}>
          Məhsul Payları
        </ThemedText>
        <ThemedText style={[
          styles.legendSubtitle,
          { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)' }
        ]}>
          Toxunun ətraflı məlumat üçün
        </ThemedText>
      </View>
      
      <View style={styles.legendContainer}>
        {pieData.map((item, index) => (
          <TouchableOpacity
            key={`${item.fullName || item.name}-${index}`}
            style={[
              styles.modernLegendItem,
              {
                backgroundColor: selectedSlice === item.name
                  ? `${item.color}15`
                  : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'),
                borderLeftColor: item.color,
                borderColor: selectedSlice === item.name
                  ? item.color
                  : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                borderWidth: selectedSlice === item.name ? 1 : 0.5,
              }
            ]}
            onPress={() => setSelectedSlice(selectedSlice === item.name ? null : item.name)}
          >
            <View style={styles.modernLegendContent}>
              <View style={styles.modernLegendLeft}>
                <View style={styles.modernLegendRank}>
                  <ThemedText style={[
                    styles.rankText,
                    { color: item.color }
                  ]}>
                    #{index + 1}
                  </ThemedText>
                </View>
                
                <View style={styles.modernLegendInfo}>
                                      <ThemedText style={[
                      styles.modernLegendText,
                      { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
                    ]} numberOfLines={2}>
                      {item.fullName || item.name}
                    </ThemedText>
                  <View style={styles.modernLegendStats}>
                    <ThemedText style={[
                      styles.modernLegendQuantity,
                      { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(74,53,49,0.8)' }
                    ]}>
                      {item.population.toLocaleString()} ədəd
                    </ThemedText>
                    <View style={styles.percentageBadge}>
                      <ThemedText style={[
                        styles.modernLegendPercentage,
                        { color: item.color }
                      ]}>
                        {item.percentage}%
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.modernLegendRight}>
                <View style={[
                  styles.colorIndicator,
                  { backgroundColor: item.color }
                ]} />
                <MaterialCommunityIcons
                  name={selectedSlice === item.name ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(74,53,49,0.4)'}
                />
              </View>
            </View>
            
            {selectedSlice === item.name && (
              <View style={[
                styles.modernDetailsContainer,
                { borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
              ]}>
                <View style={styles.modernDetailRow}>
                  <MaterialCommunityIcons
                    name="chart-bar"
                    size={14}
                    color={item.color}
                  />
                  <ThemedText style={[
                    styles.modernDetailText,
                    { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(74,53,49,0.8)' }
                  ]}>
                    Ümumi satışın {item.percentage}%-ni təşkil edir
                  </ThemedText>
                </View>
                <View style={styles.modernDetailRow}>
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={14}
                    color={item.color}
                  />
                  <ThemedText style={[
                    styles.modernDetailText,
                    { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(74,53,49,0.8)' }
                  ]}>
                    Ortalama günlük satış: {Math.round(item.population / 30)} ədəd
                  </ThemedText>
                </View>
                <View style={styles.modernDetailRow}>
                  <MaterialCommunityIcons
                    name="star"
                    size={14}
                    color={item.color}
                  />
                  <ThemedText style={[
                    styles.modernDetailText,
                    { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(74,53,49,0.8)' }
                  ]}>
                    {index === 0 ? 'Ən populyar məhsul' : `${index + 1}. ən populyar məhsul`}
                  </ThemedText>
                </View>
              </View>
            )}
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  centerTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  centerValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  centerUnit: {
    fontSize: 10,
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  legendHeader: {
    marginBottom: 12,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  legendSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  legendFlatList: {
    maxHeight: screenHeight * 0.45,
    minHeight: 200,
  },
  legendContainer: {
    paddingBottom: 20,
  },
  legendFlatListContent: {
    paddingBottom: 20,
    flexGrow: 2,
  },
  modernLegendItem: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 2,
    marginHorizontal: 4,
  },
  modernLegendContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernLegendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modernLegendRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modernLegendInfo: {
    flex: 1,
  },
  modernLegendText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  modernLegendStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modernLegendQuantity: {
    fontSize: 12,
    fontWeight: '500',
  },
  percentageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modernLegendPercentage: {
    fontSize: 11,
    fontWeight: '700',
  },
  modernLegendRight: {
    alignItems: 'center',
    gap: 12,
    marginLeft: 12,
    marginBottom: 8,
  },
  colorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modernDetailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  modernDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modernDetailText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
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
