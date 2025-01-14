import React, { useEffect, useState } from 'react';
import { TouchableOpacity, FlatList, View, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EmptyOrdersState from './EmptyOrderState';
import { formatWhatsAppMessage, shareViaWhatsApp } from './WPShareText';
import * as Clipboard from 'expo-clipboard';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  useSharedValue 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface BranchQuantity {
  branchName: string;
  quantity: number;
}

interface OrdersTotalSummaryProps {
  ordersData: any;
  SHEET_HEIGHT: number;
  scrollRef: React.RefObject<FlatList>;
}

interface ProductItemProps {
  product: string;
  total: number;
  isExpanded: boolean;
  onToggle: () => void;
  branchQuantities: BranchQuantity[];
  isDark: boolean;
}

const normalizeProductName = (name: string): string => {
  return name.trim().toLowerCase();
};

// ProductItem Component
const ProductItem = React.memo(({ 
  product, 
  total, 
  isExpanded, 
  onToggle, 
  branchQuantities, 
  isDark 
}: ProductItemProps) => {
  const expandAnimation = useSharedValue(0);

  useEffect(() => {
    expandAnimation.value = withSpring(isExpanded ? 1 : 0, {
      damping: 15,
      stiffness: 100,
    });
  }, [isExpanded]);

  const expandStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(
      expandAnimation.value,
      [0, 1],
      [0, branchQuantities.length * 50]
    ),
    opacity: expandAnimation.value,
  }));

  return (
    <ThemedView style={{
      marginVertical: 4,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.03)',
    }}>
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle();
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.02)',
          gap: 12,
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

        <MaterialCommunityIcons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)'}
        />
      </TouchableOpacity>

      <Animated.View style={[{
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(74,53,49,0.01)',
      }, expandStyle]}>
        {branchQuantities.map((branch, index) => (
          <View
            key={branch.branchName}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              paddingLeft: 52,
              borderTopWidth: index === 0 ? 1 : 0,
              borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.03)',
            }}
          >
            <ThemedText style={{
              flex: 1,
              fontSize: 14,
              color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(74,53,49,0.8)',
            }}>
              {branch.branchName}
            </ThemedText>
            <ThemedText style={{
              fontSize: 14,
              fontWeight: '600',
              color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
            }}>
              {branch.quantity}
            </ThemedText>
          </View>
        ))}
      </Animated.View>
    </ThemedView>
  );
});

// Main Component
export function OrdersTotalSummary({ ordersData, SHEET_HEIGHT, scrollRef }: OrdersTotalSummaryProps) {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const getBranchQuantities = (productName: string): BranchQuantity[] => {
    const quantities: BranchQuantity[] = [];
    Object.entries(ordersData).forEach(([branchName, products]: [string, any]) => {
      Object.entries(products).forEach(([product, quantity]) => {
        if (normalizeProductName(product) === normalizeProductName(productName)) {
          quantities.push({
            branchName,
            quantity: parseFloat(quantity as string)
          });
        }
      });
    });
    return quantities.sort((a, b) => b.quantity - a.quantity);
  };

  const calculateTotals = () => {
    const totals: { [key: string]: { normalizedName: string, originalName: string, quantity: number } } = {};
    
    Object.values(ordersData).forEach((branchProducts: any) => {
      Object.entries(branchProducts).forEach(([product, quantity]) => {
        const normalizedName = normalizeProductName(product);
        
        if (!totals[normalizedName]) {
          totals[normalizedName] = {
            normalizedName,
            originalName: product,
            quantity: 0
          };
        }
        
        totals[normalizedName].quantity += parseFloat(quantity as string);
      });
    });

    const finalTotals: { [key: string]: number } = {};
    Object.values(totals).forEach(({ originalName, quantity }) => {
      finalTotals[originalName] = quantity;
    });
    
    return finalTotals;
  };

  if (!ordersData || Object.keys(ordersData).length === 0) {
    return (
      <ThemedView style={{ 
        flex: 1,
        backgroundColor: isDark ? PastryColors.chocolate : PastryColors.vanilla 
      }}>
        <EmptyOrdersState />
      </ThemedView>
    );
  }
  
  const totals = calculateTotals();
  const totalProducts = Object.keys(totals).length;
  const totalQuantity = Object.values(totals).reduce((sum, qty) => sum + qty, 0);
  const totalBranches = Object.keys(ordersData).length;
  const totalEntries = Object.entries(totals);

  const handleCopy = () => {
    try {
      const message = decodeURIComponent(formatWhatsAppMessage(totals, totalProducts, totalQuantity, totalBranches));
      Clipboard.setString(message);
    } catch (error) {
      Alert.alert(
        "Xəta",
        "Məlumatları kopyalayarkən xəta baş verdi",
        [{ text: "OK" }],
        { cancelable: true }
      );
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header Section */}
      <ThemedView style={{
        backgroundColor: isDark ? PastryColors.chocolate : PastryColors.vanilla,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
        paddingBottom: 2
      }}>
        <View style={{
          padding: 20,
          flexDirection: 'column',
          gap: 12,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}>
            <ThemedView style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              backgroundColor: 'transparent',
              flex: 1,
              marginRight: 12,
            }}>
              <ThemedView style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.07)',
                padding: 8,
                borderRadius: 10,
                flexShrink: 0,
              }}>
                <MaterialCommunityIcons
                  name="chart-box"
                  size={24}
                  color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
                />
              </ThemedView>
              <ThemedView style={{ 
                backgroundColor: 'transparent', 
                gap: 4,
                flex: 1,
              }}>
                <ThemedText 
                  numberOfLines={1} 
                  style={{
                    fontSize: 20,
                    fontWeight: '600',
                    color: isDark ? PastryColors.vanilla : PastryColors.chocolate
                  }}
                >
                  Ümumi Cəm
                </ThemedText>
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  flexWrap: 'wrap',
                  gap: 8 
                }}>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    gap: 4 
                  }}>
                    <MaterialCommunityIcons
                      name="package-variant"
                      size={14}
                      color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)'}
                    />
                    <ThemedText 
                      numberOfLines={1}
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)',
                      }}
                    >
                      {totalProducts} növ
                    </ThemedText>
                  </View>

                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    gap: 4 
                  }}>
                    <MaterialCommunityIcons
                      name="pound"
                      size={14}
                      color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)'}
                    />
                    <ThemedText 
                      numberOfLines={1}
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)',
                      }}
                    >
                      {totalQuantity} ədəd
                    </ThemedText>
                  </View>

                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    gap: 4 
                  }}>
                    <MaterialCommunityIcons
                      name="store"
                      size={14}
                      color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)'}
                    />
                    <ThemedText 
                      numberOfLines={1}
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)',
                      }}
                    >
                      {totalBranches} şöbə
                    </ThemedText>
                  </View>
                </View>
              </ThemedView>
            </ThemedView>

            <View style={{
              flexDirection: 'row',
              gap: 8,
              flexShrink: 0,
            }}>
              <TouchableOpacity
                onPress={() => {
                  const message = formatWhatsAppMessage(totals, totalProducts, totalQuantity, totalBranches);
                  shareViaWhatsApp(message);
                }}
                style={{
                  backgroundColor: '#25D366',
                  padding: 8,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <MaterialCommunityIcons
                  name="whatsapp"
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCopy}
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.07)',
                  padding: 8,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <MaterialCommunityIcons
                  name="content-copy"
                  size={20}
                  color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ThemedView>

      {/* Product List */}
      <FlatList
        ref={scrollRef}
        data={totalEntries}
        keyExtractor={item => item[0]}
        renderItem={({ item: [product, total] }) => (
          <ProductItem
            product={product}
            total={total}
            isExpanded={expandedProduct === product}
            onToggle={() => setExpandedProduct(expandedProduct === product ? null : product)}
            branchQuantities={getBranchQuantities(product)}
            isDark={isDark}
          />
        )}
        contentContainerStyle={{ 
          padding: 12,
          paddingBottom: 30 + insets.bottom
        }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        style={{ 
          maxHeight: SHEET_HEIGHT - 200
        }}
      />
    </ThemedView>
  );
}