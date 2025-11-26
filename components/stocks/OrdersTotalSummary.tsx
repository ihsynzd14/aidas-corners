import React, { useEffect, useState } from 'react';
import { TouchableOpacity, FlatList, View, Alert, Text } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EmptyOrdersState from './EmptyOrderState';
import { formatWhatsAppMessage, shareViaWhatsApp } from './WPShareText';
import * as Clipboard from 'expo-clipboard';
import { getActiveTemplates } from '@/services/customShareService';
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
  scrollRef: React.RefObject<any>;
}

type SortType = 'alpha-asc' | 'alpha-desc' | 'quantity-asc' | 'quantity-desc';

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

// Modern Filter Component
const FilterButton = React.memo(({
  icon,
  label,
  isActive,
  onPress,
  isDark
}: {
  icon: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
  isDark: boolean;
}) => {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }));

  const handlePress = () => {
    scaleValue.value = withSpring(0.92, {}, () => {
      scaleValue.value = withSpring(1);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          backgroundColor: isActive
            ? isDark ? PastryColors.chocolate : PastryColors.primary
            : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(74,53,49,0.05)',
          borderWidth: 1.5,
          borderColor: isActive
            ? isDark ? PastryColors.primary : PastryColors.chocolate
            : 'transparent',
          shadowColor: isActive ? PastryColors.primary : 'transparent',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: isActive ? 3 : 0,
        }}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={15}
          color={isActive
            ? isDark ? PastryColors.vanilla : '#FFFFFF'
            : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)'}
        />
        <Text style={{
          fontSize: 11.5,
          fontWeight: isActive ? '700' : '500',
          color: isActive
            ? isDark ? PastryColors.vanilla : '#FFFFFF'
            : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)',
        }}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

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
  const [sortType, setSortType] = useState<SortType>('quantity-desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
  let totalEntries = Object.entries(totals);

  // Apply sorting based on sortType
  if (sortType === 'alpha-asc') {
    totalEntries = totalEntries.sort((a, b) => a[0].localeCompare(b[0], 'az'));
  } else if (sortType === 'alpha-desc') {
    totalEntries = totalEntries.sort((a, b) => b[0].localeCompare(a[0], 'az'));
  } else if (sortType === 'quantity-asc') {
    totalEntries = totalEntries.sort((a, b) => a[1] - b[1]);
  } else if (sortType === 'quantity-desc') {
    totalEntries = totalEntries.sort((a, b) => b[1] - a[1]);
  }

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

  const handleCopyByRegions = async () => {
    try {
      const templates = await getActiveTemplates();

      if (templates.length === 0) {
        Alert.alert(
          "Məlumat",
          "Heç bir aktiv şablon tapılmadı. Zəhmət olmasa ilk növbədə şablon yaradın.",
          [{ text: "OK" }],
          { cancelable: true }
        );
        return;
      }

      let message = `*Aida's Corner - Bölgələrə Görə Sifariş Hesabatı*\n`;
      message += `📅 ${formatDateString(new Date())}\n\n`;

      // Group products by templates
      templates.forEach(template => {
        const templateProducts = template.products.filter(product =>
          totals.hasOwnProperty(product)
        );

        if (templateProducts.length > 0) {
          message += `📍 *${template.name}*\n`;
          templateProducts.forEach(product => {
            message += `• ${product}: ${totals[product]} ədəd\n`;
          });
          message += '\n';
        }
      });

      // Add products not in any template
      const allTemplateProducts = templates.flatMap(t => t.products);
      const unassignedProducts = Object.keys(totals).filter(
        product => !allTemplateProducts.includes(product)
      );

      if (unassignedProducts.length > 0) {
        message += `📦 *Digər Məhsullar*\n`;
        unassignedProducts.forEach(product => {
          message += `• ${product}: ${totals[product]} ədəd\n`;
        });
      }

      Clipboard.setString(message);

      Alert.alert(
        "Uğurlu",
        "Məlumatlar bölgələrə görə kopyalandı",
        [{ text: "OK" }],
        { cancelable: true }
      );
    } catch (error) {
      Alert.alert(
        "Xəta",
        "Məlumatları kopyalayarkən xəta baş verdi",
        [{ text: "OK" }],
        { cancelable: true }
      );
    }
  };

  const formatDateString = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleShareByRegions = async () => {
    try {
      const templates = await getActiveTemplates();

      if (templates.length === 0) {
        Alert.alert(
          "Məlumat",
          "Heç bir aktiv şablon tapılmadı. Zəhmət olmasa ilk növbədə şablon yaradın.",
          [{ text: "OK" }],
          { cancelable: true }
        );
        return;
      }

      let message = `*Aida's Corner - Bölgələrə Görə Sifariş Hesabatı*\n`;
      message += `📅 ${formatDateString(new Date())}\n\n`;

      // Group products by templates
      templates.forEach(template => {
        const templateProducts = template.products.filter(product =>
          totals.hasOwnProperty(product)
        );

        if (templateProducts.length > 0) {
          message += `📍 *${template.name}*\n`;
          templateProducts.forEach(product => {
            message += `• ${product}: ${totals[product]} ədəd\n`;
          });
          message += '\n';
        }
      });

      // Add products not in any template
      const allTemplateProducts = templates.flatMap(t => t.products);
      const unassignedProducts = Object.keys(totals).filter(
        product => !allTemplateProducts.includes(product)
      );

      if (unassignedProducts.length > 0) {
        message += `📦 *Digər Məhsullar*\n`;
        unassignedProducts.forEach(product => {
          message += `• ${product}: ${totals[product]} ədəd\n`;
        });
      }

      shareViaWhatsApp(encodeURIComponent(message));
    } catch (error) {
      Alert.alert(
        "Xəta",
        "Məlumatları paylaşarkən xəta baş verdi",
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
              <TouchableOpacity
                onPress={() => {
                  handleShareByRegions();
                }}
                style={{
                  backgroundColor: '#FFD700',
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
                onPress={handleCopyByRegions}
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
                  name="account-group"
                  size={20}
                  color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ThemedView>

      {/* Filter Component */}
      <ThemedView style={{
        marginHorizontal: 12,
        marginTop: 8,
        marginBottom: 4,
        borderRadius: 16,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(74,53,49,0.02)',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.05)',
        overflow: 'hidden',
      }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsFilterOpen(!isFilterOpen);
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 10,
          }}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={16}
            color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(74,53,49,0.4)'}
          />
          <ThemedText style={{
            fontSize: 11,
            fontWeight: '600',
            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(74,53,49,0.4)',
            letterSpacing: 0.5,
            textDecorationLine: 'none',
          }}>
            SIRALA
          </ThemedText>
          <View style={{ flex: 1, height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.05)' }} />
          <MaterialCommunityIcons
            name={isFilterOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(74,53,49,0.4)'}
          />
        </TouchableOpacity>

        {isFilterOpen && (
          <View style={{
            flexDirection: 'row',
            gap: 7,
            paddingHorizontal: 10,
            paddingBottom: 10,
            flexWrap: 'wrap',
          }}>
            <FilterButton
              icon="sort-alphabetical-ascending"
              label="A-Z"
              isActive={sortType === 'alpha-asc'}
              onPress={() => setSortType('alpha-asc')}
              isDark={isDark}
            />
            <FilterButton
              icon="sort-alphabetical-descending"
              label="Z-A"
              isActive={sortType === 'alpha-desc'}
              onPress={() => setSortType('alpha-desc')}
              isDark={isDark}
            />
            <FilterButton
              icon="sort-numeric-ascending"
              label="Azdan Çoxa"
              isActive={sortType === 'quantity-asc'}
              onPress={() => setSortType('quantity-asc')}
              isDark={isDark}
            />
            <FilterButton
              icon="sort-numeric-descending"
              label="Çoxdan Aza"
              isActive={sortType === 'quantity-desc'}
              onPress={() => setSortType('quantity-desc')}
              isDark={isDark}
            />
          </View>
        )}
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