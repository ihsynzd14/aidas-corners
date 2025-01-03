import React from 'react';
import { TouchableOpacity, FlatList } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OrdersTotalSummaryProps {
  ordersData: any;
  SHEET_HEIGHT: number;
  scrollRef: React.RefObject<FlatList>;
}

export function OrdersTotalSummary({ ordersData, SHEET_HEIGHT, scrollRef }: OrdersTotalSummaryProps) {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const calculateTotals = () => {
    const totals: { [key: string]: number } = {};
    Object.values(ordersData).forEach((branchProducts: any) => {
      Object.entries(branchProducts).forEach(([product, quantity]) => {
        totals[product] = (totals[product] || 0) + parseFloat(quantity as string);
      });
    });
    return totals;
  };

  if (!ordersData || Object.keys(ordersData).length === 0) return null;

  const totals = calculateTotals();
  const totalProducts = Object.keys(totals).length;
  const totalQuantity = Object.values(totals).reduce((sum, qty) => sum + qty, 0);
  const totalEntries = Object.entries(totals);

  const renderItem = ({ item: [product, total] }: { item: [string, number] }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginVertical: 4,
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.02)',
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.03)',
      }}
    >
      <ThemedView style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.05)',
        padding: 8,
        borderRadius: 8
      }}>
        <MaterialCommunityIcons
          name="cookie"
          size={18}
          color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)'}
        />
      </ThemedView>
      
      <ThemedText style={{
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: isDark ? PastryColors.vanilla : '#333'
      }}>
        {product}
      </ThemedText>
      
      <ThemedView style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
      }}>
        <MaterialCommunityIcons
          name="pound"
          size={16}
          color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)'}
        />
        <ThemedText style={{
          fontSize: 14,
          fontWeight: '600',
          color: isDark ? PastryColors.vanilla : PastryColors.chocolate
        }}>
          {total}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView style={{
        backgroundColor: isDark ? PastryColors.chocolate : PastryColors.vanilla,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
        paddingBottom: 16
      }}>
        <ThemedView style={{
          padding: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'transparent'
        }}>
          <ThemedView style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: 'transparent'
          }}>
            <ThemedView style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.07)',
              padding: 8,
              borderRadius: 10
            }}>
              <MaterialCommunityIcons
                name="chart-box"
                size={24}
                color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
              />
            </ThemedView>
            <ThemedView style={{ backgroundColor: 'transparent', gap: 4 }}>
              <ThemedText style={{
                fontSize: 20,
                fontWeight: '600',
                color: isDark ? PastryColors.vanilla : PastryColors.chocolate
              }}>
                Ümumi Cəm
              </ThemedText>
              <ThemedText style={{
                fontSize: 13,
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)',
              }}>
                Bütün filiallar üzrə
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.07)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
          }}>
            <MaterialCommunityIcons
              name="package-variant"
              size={16}
              color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)'}
            />
            <ThemedText style={{
              color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
              fontWeight: '500'
            }}>
              {totalProducts} növ • {totalQuantity} ədəd
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <FlatList
        ref={scrollRef}
        data={totalEntries}
        keyExtractor={item => item[0]}
        renderItem={renderItem}
        contentContainerStyle={{ 
          padding: 12,
          paddingBottom: 20 + insets.bottom
        }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        style={{ 
          maxHeight: SHEET_HEIGHT - 180
        }}
      />
    </ThemedView>
  );
}