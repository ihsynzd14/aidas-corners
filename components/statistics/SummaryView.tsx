import React, { useState } from 'react';
import { StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

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

  const toggleExpand = (productName: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [productName]: !prev[productName]
    }));
  };

  const formatQuantity = (quantity: number, productName: string) => {
    return quantity % 1 === 0 ? Math.round(quantity).toString() : quantity.toFixed(1);
  };

  return (
    <ScrollView style={styles.scrollView}>
      {productStats.map((stat, index) => (
        <Pressable 
          key={index} 
          onPress={() => toggleExpand(stat.productName)}
        >
          <ThemedView style={[
            styles.productCard,
            { 
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            }
          ]}>
            <ThemedView style={styles.productHeader}>
              <ThemedView style={styles.headerContent}>
                <ThemedView style={styles.headerLeft}>
                  <ThemedView style={styles.productNameContainer}>
                    <MaterialCommunityIcons
                      name="cookie"
                      size={20}
                      color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
                      style={styles.productIcon}
                    />
                    <ThemedText style={[
                      styles.productName,
                      { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
                    ]}>
                      {stat.productName}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={[styles.totalQuantityContainer, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(74,53,49,0.04)',
                  }]}>
                    <MaterialIcons
                      name="summarize"
                      size={16}
                      color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)'}
                      style={styles.totalIcon}
                    />
                    <ThemedText style={[
                      styles.totalQuantityLabel,
                      { color: isDark ? '#FFFFFF' : 'rgba(65,13,23,0.7)' }
                    ]}>
                      Ümumi:
                    </ThemedText>
                    <ThemedText style={[
                      styles.totalQuantityValue,
                      { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
                    ]}>
                      {formatQuantity(stat.totalQuantity, stat.productName)}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView style={[styles.expandIconContainer, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(74,53,49,0.04)',
                }]}>
                  <MaterialIcons 
                    name={expandedItems[stat.productName] ? 'expand-less' : 'expand-more'} 
                    size={20} 
                    color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
                  />
                </ThemedView>
              </ThemedView>
            </ThemedView>
            
            {expandedItems[stat.productName] && (
              <ThemedView style={styles.tableContainer}>
                <ThemedView style={[
                  styles.tableHeader,
                  { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)' }
                ]}>
                  <ThemedText style={[
                    styles.columnHeader,
                    { flex: 1.5, color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
                  ]}>Filial</ThemedText>
                  <ThemedText style={[
                    styles.columnHeader,
                    { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
                  ]}>Miqdar</ThemedText>
                  <ThemedText style={[
                    styles.columnHeader,
                    { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
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
                        { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
                      ]}>{formatQuantity(branchStat.quantity, stat.productName)}</ThemedText>
                      <ThemedText style={[
                        styles.percentage,
                        { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
                      ]}>
                        {((branchStat.quantity / stat.totalQuantity) * 100).toFixed(1)}%
                      </ThemedText>
                    </ThemedView>
                  ))}
              </ThemedView>
            )}
          </ThemedView>
        </Pressable>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 16,
  },
  productCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  productHeader: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  productNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productIcon: {
    marginRight: 8,
  },
  productName: {
    fontSize: 17,
    fontWeight: '600',
  },
  totalQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  totalIcon: {
    marginRight: 4,
  },
  totalQuantityLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  totalQuantityValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  expandIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableContainer: {
    padding: 12,
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