import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AntDesign } from '@expo/vector-icons';
import { PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface DailyStats {
  date: string;
  quantity: number;
}

interface DailyViewProps {
  selectedProduct: string;
  selectedBranch: string;
  dailyStats: DailyStats[];
  onSelectionPress: () => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  selectedProduct,
  selectedBranch,
  dailyStats,
  onSelectionPress,
}) => {
  const isDark = useColorScheme() === 'dark';
  
  const formatQuantity = (quantity: number) => {
    if (!quantity || quantity === 0) return null;
    return quantity % 1 === 0 ? Math.round(quantity).toString() : quantity.toFixed(1);
  };

  return (
    <ScrollView style={styles.scrollView}>
      <TouchableOpacity 
        style={[
          styles.selectionButton,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }
        ]} 
        onPress={onSelectionPress}
      >
        <ThemedText style={[
          styles.selectionButtonText,
          { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
        ]}>
          {selectedProduct && selectedBranch 
            ? `${selectedProduct} - ${selectedBranch}` 
            : 'Məhsul və Filial seçin'}
        </ThemedText>
        <AntDesign 
          name="down" 
          size={20} 
          color={isDark ? PastryColors.vanilla : PastryColors.chocolate} 
        />
      </TouchableOpacity>

      {selectedProduct && selectedBranch && (
        <ThemedView style={[
          styles.productCard,
          { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            borderWidth: 1
          }
        ]}>
          <ThemedView style={styles.tableContainer}>
            <ThemedView style={[
              styles.tableHeader,
              { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)' }
            ]}>
              <ThemedText style={[
                styles.columnHeader,
                { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
              ]}>Tarix</ThemedText>
              <ThemedText style={[
                styles.columnHeader,
                { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
              ]}>Miqdar</ThemedText>
            </ThemedView>
            
            {dailyStats.map((stat, index) => {
              const formattedQuantity = formatQuantity(stat.quantity);
              if (!formattedQuantity) return null;

              return (
                <ThemedView 
                  key={index} 
                  style={[
                    styles.tableRow,
                    index % 2 === 0 
                      ? { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(74,53,49,0.03)' }
                      : { backgroundColor: isDark ? 'transparent' : '#fff' }
                  ]}
                >
                  <ThemedText style={[
                    styles.date,
                    { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(74,53,49,0.8)' }
                  ]}>{stat.date}</ThemedText>
                  <ThemedText style={[
                    styles.quantity,
                    { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
                  ]}>{formattedQuantity}</ThemedText>
                </ThemedView>
              );
            })}
          </ThemedView>
        </ThemedView>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 16,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectionButtonText: {
    flex: 1,
    fontSize: 16,
  },
  productCard: {
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
  date: {
    flex: 1,
    fontSize: 15,
    textAlign: 'center',
  },
  quantity: {
    flex: 1,
    fontSize: 15,
    textAlign: 'center',
  },
}); 