import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

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
  const formatQuantity = (quantity: number) => {
    return quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1);
  };

  return (
    <ScrollView style={styles.scrollView}>
      {productStats.map((stat, index) => (
        <ThemedView key={index} style={styles.productCard}>
          <ThemedView style={styles.productHeader}>
            <ThemedText style={styles.productName}>
              {stat.productName}
            </ThemedText>
            <ThemedText style={styles.totalQuantity}>
              Ümumi: {formatQuantity(stat.totalQuantity)}
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.tableContainer}>
            <ThemedView style={styles.tableHeader}>
              <ThemedText style={[styles.columnHeader, { flex: 1.5 }]}>Filial</ThemedText>
              <ThemedText style={styles.columnHeader}>Miqdar</ThemedText>
              <ThemedText style={styles.columnHeader}>%</ThemedText>
            </ThemedView>
            
            {Object.entries(stat.branchStats)
              .sort(([, a], [, b]) => b.quantity - a.quantity)
              .map(([branchName, branchStat], bIndex) => (
                <ThemedView 
                  key={bIndex} 
                  style={[
                    styles.tableRow,
                    bIndex % 2 === 0 ? styles.evenRow : styles.oddRow
                  ]}
                >
                  <ThemedText style={[styles.branchName, { flex: 1.5 }]}>{branchName}</ThemedText>
                  <ThemedText style={styles.quantity}>{formatQuantity(branchStat.quantity)}</ThemedText>
                  <ThemedText style={styles.percentage}>
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
    backgroundColor: '#fff',
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
    backgroundColor: 'rgba(74, 53, 49, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 53, 49, 0.1)',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A3531',
    marginBottom: 4,
  },
  totalQuantity: {
    fontSize: 16,
    color: '#4A3531',
    fontWeight: '600',
  },
  tableContainer: {
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(74, 53, 49, 0.1)',
    marginBottom: 8,
  },
  columnHeader: {
    flex: 1,
    fontWeight: 'bold',
    color: '#4A3531',
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
  evenRow: {
    backgroundColor: 'rgba(74, 53, 49, 0.03)',
  },
  oddRow: {
    backgroundColor: '#fff',
  },
  branchName: {
    flex: 1,
    fontSize: 15,
    color: '#4A3531',
    paddingLeft: 8,
  },
  quantity: {
    flex: 1,
    fontSize: 15,
    color: '#4A3531',
    textAlign: 'center',
  },
  percentage: {
    flex: 1,
    fontSize: 15,
    color: '#4A3531',
    textAlign: 'center',
  },
}); 