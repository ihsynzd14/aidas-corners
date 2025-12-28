import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { colorScheme } from '@/constants/colorScheme';
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
  const cardBg = isDark ? colorScheme.cardDark : colorScheme.cardLight;
  const textColor = isDark ? colorScheme.textDark : colorScheme.textLight;
  const secondaryTextColor = isDark ? colorScheme.textSubtleDark : colorScheme.textSubtleLight;
  const borderColor = isDark ? colorScheme.borderRed : colorScheme.borderRed;
  const shadowColor = colorScheme.accentRed;
  
  const formatQuantity = (quantity: number) => {
    if (!quantity || quantity === 0) return null;
    return quantity % 1 === 0 ? Math.round(quantity).toString() : quantity.toFixed(1);
  };

  return (
    <ScrollView style={styles.scrollView}>
      <TouchableOpacity 
        style={[
          styles.selectionButton,
          { 
            backgroundColor: cardBg,
            shadowColor: shadowColor,
            borderColor: borderColor,
            borderWidth: 1,
          }
        ]} 
        onPress={onSelectionPress}
      >
        <View style={styles.selectionButtonContent}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(217, 166, 163, 0.1)' }
          ]}>
            <MaterialCommunityIcons
              name="calendar-today"
              size={24}
              color={colorScheme.accentRedlight}
            />
          </View>
          <View style={styles.selectionTextContainer}>
            <ThemedText style={[
              styles.selectionButtonText,
              { color: textColor }
            ]}>
              {selectedProduct && selectedBranch 
                ? `${selectedProduct} - ${selectedBranch}` 
                : 'Məhsul və Filial seçin'}
            </ThemedText>
            <ThemedText style={[
              styles.selectionSubText,
              { color: secondaryTextColor }
            ]}>
              {selectedProduct && selectedBranch ? 'Günlük statistika' : 'Seçim etmək üçün toxunun'}
            </ThemedText>
          </View>
          <AntDesign 
            name="down" 
            size={20} 
            color={secondaryTextColor} 
          />
        </View>
      </TouchableOpacity>

      {selectedProduct && selectedBranch && (
        <View style={[
          styles.productCard,
          { 
            backgroundColor: cardBg,
            shadowColor: shadowColor,
            borderColor: borderColor,
            borderWidth: 1,
          }
        ]}>
          <View style={styles.cardHeader}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(217, 166, 163, 0.1)' }
            ]}>
              <MaterialCommunityIcons
                name="chart-line"
                size={24}
                color={colorScheme.accentRedlight}
              />
            </View>
            <View style={styles.cardHeaderText}>
              <ThemedText style={[styles.cardTitle, { color: textColor }]}>
                Günlük Statistika
              </ThemedText>
              <ThemedText style={[styles.cardSubTitle, { color: secondaryTextColor }]}>
                {dailyStats.filter(stat => formatQuantity(stat.quantity)).length} gün üzrə məlumat
              </ThemedText>
            </View>
          </View>

          <View style={styles.tableContainer}>
            <View style={[
              styles.tableHeader,
              { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)' }
            ]}>
              <ThemedText style={[
                styles.columnHeader,
                { color: textColor }
              ]}>Tarix</ThemedText>
              <ThemedText style={[
                styles.columnHeader,
                { color: textColor }
              ]}>Miqdar</ThemedText>
            </View>
            
            {dailyStats.map((stat, index) => {
              const formattedQuantity = formatQuantity(stat.quantity);
              if (!formattedQuantity) return null;

              return (
                <View 
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
                    { color: textColor }
                  ]}>{formattedQuantity}</ThemedText>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 16,
    paddingBottom: 150,
  },
  selectionButton: {
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
  },
  selectionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionTextContainer: {
    flex: 1,
  },
  selectionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectionSubText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  productCard: {
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 0,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  tableContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  date: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  quantity: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
});