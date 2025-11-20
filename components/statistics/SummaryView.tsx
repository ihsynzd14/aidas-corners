import React, { useState, useMemo } from 'react';
import { StyleSheet, ScrollView, Pressable, View, Text } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { colorScheme } from '@/constants/colorScheme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';

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

interface SummaryViewProps {
  productStats: ProductStats[];
}

export const SummaryView: React.FC<SummaryViewProps> = ({ productStats }) => {
  const isDark = useColorScheme() === 'dark';
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const grandTotal = useMemo(() => {
    return productStats.reduce((acc, curr) => acc + curr.totalQuantity, 0);
  }, [productStats]);

  const toggleExpand = (productName: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [productName]: !prev[productName]
    }));
  };

  const formatQuantity = (quantity: number) => {
    return quantity % 1 === 0 ? Math.round(quantity).toString() : quantity.toFixed(1);
  };

  // Color helpers based on theme
  const cardBg = isDark ? colorScheme.cardDark : colorScheme.cardLight;
  const textColor = isDark ? colorScheme.textDark : colorScheme.textLight;
  const secondaryTextColor = isDark ? colorScheme.textSubtleDark : colorScheme.textSubtleLight;
  const borderColor = isDark ? colorScheme.borderRed : colorScheme.borderRed; // Using borderRed as requested
  const progressBg = isDark ? colorScheme.lightRed : colorScheme.lightRed; // Using lightRed for background
  const shadowColor = colorScheme.accentRed;

  return (
    <ScrollView style={styles.scrollView}>
      {productStats.map((stat, index) => {
        const percentage = grandTotal > 0 ? (stat.totalQuantity / grandTotal) * 100 : 0;
        const isExpanded = expandedItems[stat.productName];

        return (
          <Pressable
            key={index}
            onPress={() => toggleExpand(stat.productName)}
          >
            <View style={[
              styles.productCard,
              {
                backgroundColor: cardBg,
                shadowColor: shadowColor,
                borderColor: borderColor,
                borderWidth: 1, // Adding border width to make borderRed visible
              }
            ]}>
              <View style={styles.topSection}>
                {/* Left Icon */}
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(217, 166, 163, 0.1)' } // Using primary color tint
                ]}>
                  <MaterialCommunityIcons
                    name="cookie"
                    size={28}
                    color={colorScheme.accentRedlight}
                  />
                </View>

                {/* Right Content */}
                <View style={styles.contentContainer}>
                  {/* Header Section */}
                  <View style={styles.headerContainer}>
                    <View style={styles.headerLeft}>
                      <Text style={[styles.productName, { color: textColor }]} adjustsFontSizeToFit={true} minimumFontScale={0.8} numberOfLines={2}>
                        {stat.productName}
                      </Text>
                      <Text style={[styles.totalQuantityText, { color: secondaryTextColor }]}>
                        {formatQuantity(stat.totalQuantity)} ədəd
                      </Text>
                    </View>
                    
                    <MaterialIcons
                      name={isExpanded ? 'expand-less' : 'expand-more'}
                      size={24}
                      color={secondaryTextColor}
                    />
                  </View>

                  {/* Progress Bar Section */}
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBarBg, { backgroundColor: progressBg }]}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { 
                            backgroundColor: colorScheme.accentRedlight,
                            width: `${percentage}%` 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.percentageText, { color: secondaryTextColor }]}>
                      {Math.round(percentage)}%
                    </Text>
                  </View>
                </View>
              </View>

              {/* Expanded Table Section */}
              {isExpanded && (
                <View style={[
                  styles.tableWrapper,
                  { borderTopColor: borderColor }
                ]}>
                  <ThemedView style={styles.tableContainer}>
                    <ThemedView style={[
                      styles.tableHeader,
                      { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)' }
                    ]}>
                      <ThemedText style={[
                        styles.columnHeader,
                        { flex: 1.5, color: textColor }
                      ]}>Filial</ThemedText>
                      <ThemedText style={[
                        styles.columnHeader,
                        { color: textColor }
                      ]}>Miqdar</ThemedText>
                      <ThemedText style={[
                        styles.columnHeader,
                        { color: textColor }
                      ]}>%</ThemedText>
                    </ThemedView>

                    {Object.entries(stat.branchStats)
                      .sort(([, a], [, b]) => b.quantity - a.quantity)
                      .map(([branchName, branchStat], bIndex) => (
                        <ThemedView
                          key={bIndex}
                          style={[
                            styles.tableRow,
                            bIndex % 2 === 0
                              ? { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(74,53,49,0.03)' }
                              : { backgroundColor: isDark ? 'transparent' : '#fff' }
                          ]}
                        >
                          <ThemedText style={[
                            styles.branchName,
                            { flex: 1.5, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(74,53,49,0.8)' }
                          ]}>{branchName}</ThemedText>
                          <ThemedText style={[
                            styles.quantity,
                            { color: textColor }
                          ]}>{formatQuantity(branchStat.quantity)}</ThemedText>
                          <ThemedText style={[
                            styles.percentage,
                            { color: textColor }
                          ]}>
                            {stat.totalQuantity > 0 
                              ? ((branchStat.quantity / stat.totalQuantity) * 100).toFixed(1) 
                              : '0.0'}%
                          </ThemedText>
                        </ThemedView>
                      ))}
                  </ThemedView>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingBottom: 150,
  },
  productCard: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 0,
    width: '100%', // Ensure card takes full width of container
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24, // Circle
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'column',
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalQuantityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 9999,
  },
  percentageText: {
    width: 40,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '500',
  },
  tableWrapper: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  tableContainer: {
    // Padding handled by card padding
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  columnHeader: {
    flex: 1,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 6,
    marginVertical: 2,
  },
  branchName: {
    fontSize: 14,
    paddingLeft: 4,
  },
  quantity: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  percentage: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
});
