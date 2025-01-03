import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
import { Colors, PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface OrdersSummaryTableProps {
  ordersData: Record<string, Record<string, number>>;
}

function BranchSection({ branchName, products }: { branchName: string; products: Record<string, number>; }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDark = useColorScheme() === 'dark';

  return (
    <ThemedView style={{
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: isDark ? PastryColors.chocolate : PastryColors.vanilla,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3
    }}>
      <TouchableOpacity 
        onPress={() => setIsExpanded(!isExpanded)}
        style={{
          backgroundColor: 'transparent',
          padding: 16,
          borderBottomWidth: isExpanded ? 1 : 0,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'
        }}
      >
        <ThemedView style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'transparent'
        }}>
          <ThemedView style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            backgroundColor: 'transparent',
            flex: 1,
            gap: 12 
          }}>
            <ThemedView style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.05)',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MaterialCommunityIcons 
                name="store" 
                size={22} 
                color={isDark ? PastryColors.vanilla : PastryColors.chocolate} 
              />
            </ThemedView>
            
            <ThemedView style={{ backgroundColor: 'transparent' }}>
              <ThemedText style={{ 
                fontSize: 17, 
                fontWeight: '600',
                color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
                marginBottom: 4
              }}>
                {branchName}
              </ThemedText>
              <ThemedText style={{ 
                fontSize: 14,
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'
              }}>
                {Object.keys(products).length} məhsul
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.05)',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Feather 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={isDark ? PastryColors.vanilla : PastryColors.chocolate} 
            />
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>

      {isExpanded && (
        <ThemedView style={{
          backgroundColor: 'transparent',
          padding: 16
        }}>
          {Object.entries(products).map(([product, quantity], index) => (
            <ThemedView 
              key={product} 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 8,
                paddingVertical: 18,
                borderBottomWidth: index === Object.keys(products).length - 1 ? 0 : 1,
                borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                backgroundColor: 'transparent'
              }}
            >
              <ThemedView style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.03)',
                padding: 12,
                borderRadius: 10
              }}>
                <MaterialCommunityIcons 
                  name="cookie" 
                  size={20} 
                  color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)'} 
                />
                <ThemedText style={{ 
                  flex: 1,
                  fontSize: 17,
                  color: isDark ? PastryColors.vanilla : '#333',
                  fontWeight: '500'
                }}>
                  {product}
                </ThemedText>
              </ThemedView>
              <ThemedView style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(74,53,49,0.07)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                minWidth: 44,
                marginLeft: 12,
                alignItems: 'center',
                flexDirection: 'row',
                gap: 6
              }}>
                <ThemedText style={{
                  alignItems: 'center',
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '600',
                  color: isDark ? PastryColors.vanilla : PastryColors.chocolate
                }}>
                  {quantity}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
}

export function OrdersSummaryTable({ ordersData }: OrdersSummaryTableProps) {
  if (!ordersData || Object.keys(ordersData).length === 0) {
    return (
      <ThemedView style={{ padding: 16, alignItems: 'center' }}>
        <ThemedText>Bu tarix üçün sifariş tapılmadı</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ paddingHorizontal: 16 }}>
      {Object.entries(ordersData).map(([branchName, products]) => (
        <BranchSection key={branchName} branchName={branchName} products={products} />
      ))}
    </ThemedView>
  );
}