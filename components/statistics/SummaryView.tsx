import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

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

  const formatQuantity = (quantity: number, productName: string) => {
    const isChocolateProduct = productName.toLowerCase().includes('şokolad') || 
                              productName.toLowerCase().includes('lokumlu');
    return quantity % 1 === 0 ? Math.round(quantity).toString() : quantity.toFixed(1);
  };

  return (
    <ScrollView style={styles.scrollView}>
      {productStats.map((stat, index) => (
        <ThemedView key={index} style={[
          styles.productCard,
          { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            borderWidth: 1
          }
        ]}>
          <ThemedView style={[
            styles.productHeader,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(74,53,49,0.05)' }
          ]}>
            <ThemedText style={[
              styles.productName,
              { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
            ]}>
              {stat.productName}
            </ThemedText>
            <ThemedText style={[
              styles.totalQuantity,
              { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(74,53,49,0.8)' }
            ]}>
              Ümumi: {formatQuantity(stat.totalQuantity, stat.productName)}
            </ThemedText>
          </ThemedView>
          
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
        </ThemedView>
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
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  totalQuantity: {
    fontSize: 16,
    fontWeight: '600',
  },
  tableContainer: {
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 2,
    marginBottom: 8,
  },
  columnHeader: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  branchName: {
    flex: 1,
    fontSize: 15,
    paddingLeft: 8,
  },
  quantity: {
    flex: 1,
    fontSize: 15,
    textAlign: 'center',
  },
  percentage: {
    flex: 1,
    fontSize: 15,
    textAlign: 'center',
  },
}); 