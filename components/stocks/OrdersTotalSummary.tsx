import React, { useEffect, useState } from 'react';
import { TouchableOpacity, FlatList, View, Alert, Text, Dimensions } from 'react-native';
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
import { getBranches, getProductCorrections } from '@/utils/firebase';
import { exportToExcel } from '@/utils/excelExport';
import { Branch } from '@/types/branch';

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
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [missingBranchesExpanded, setMissingBranchesExpanded] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [productPrices, setProductPrices] = useState<Map<string, number>>(new Map());

  // Fetch all branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branches = await getBranches();
        setAllBranches(branches);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

  // Fetch product prices and calculate total earnings
  useEffect(() => {
    const fetchProductPrices = async () => {
      try {
        const productCorrections = await getProductCorrections();
        const priceMap = new Map<string, number>();

        console.log('=== OrdersTotalSummary - Price Calculation ===');
        console.log('Total products with prices:', productCorrections.filter(p => p.price !== undefined).length);

        productCorrections.forEach(product => {
          if (product.price !== undefined) {
            priceMap.set(product.correct.toLowerCase(), product.price);
            product.variations.forEach(variation => {
              priceMap.set(variation.toLowerCase(), product.price);
            });
          }
        });
        setProductPrices(priceMap);

        console.log('Price Map built with', priceMap.size, 'entries');
        console.log('Sample prices from map:');
        let sampleCount = 0;
        priceMap.forEach((price, name) => {
          if (sampleCount < 5) {
            console.log(`  - ${name}: ${price} ₼`);
            sampleCount++;
          }
        });

        // Calculate total earnings from ordersData
        if (ordersData) {
          console.log('\nCalculating earnings from ordersData...');
          let earnings = 0;
          let productsWithPrice = 0;
          let productsWithoutPrice = 0;
          const branchTotals: { [key: string]: number } = {};

          Object.entries(ordersData).forEach(([branchName, branchProducts]: [string, any]) => {
            console.log(`\n📍 Branch: ${branchName}`);
            let branchTotal = 0;
            let branchProductsWithPrice = 0;
            let branchProductsWithoutPrice = 0;

            Object.entries(branchProducts).forEach(([product, quantity]) => {
              const normalizedProduct = product.trim().toLowerCase();
              const productPrice = priceMap.get(normalizedProduct);
              const qty = parseFloat(quantity as string);

              if (productPrice !== undefined) {
                const lineTotal = qty * productPrice;
                branchTotal += lineTotal;
                earnings += lineTotal;
                productsWithPrice++;
                branchProductsWithPrice++;
                console.log(`  ✅ ${product}: ${qty} × ${productPrice} ₼ = ${lineTotal.toFixed(2)} ₼`);
              } else {
                productsWithoutPrice++;
                branchProductsWithoutPrice++;
                console.log(`  ❌ ${product}: ${qty} (no price found)`);
              }
            });

            branchTotals[branchName] = branchTotal;
            console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`  📦 Branch Total: ${branchTotal.toFixed(2)} ₼ (${branchProductsWithPrice} with price, ${branchProductsWithoutPrice} without)`);
          });

          console.log('\n=== Branch Totals Summary ===');
          Object.entries(branchTotals).forEach(([branch, total]) => {
            console.log(`  📍 ${branch}: ${total.toFixed(2)} ₼`);
          });

          console.log('\n=== Summary ===');
          console.log(`Products with price: ${productsWithPrice}`);
          console.log(`Products without price: ${productsWithoutPrice}`);
          console.log(`📊 Total Earnings (sum of all branches): ${earnings.toFixed(2)} ₼`);

          setTotalEarnings(earnings);
        } else {
          console.log('No ordersData available');
          setTotalEarnings(0);
        }
      } catch (error) {
        console.error('Error fetching product prices:', error);
      }
    };
    fetchProductPrices();
  }, [ordersData]);

  // Calculate missing branches
  // ordersData keys use format: "Type Name" (e.g., "Coffemania Azadlıq", "Next Mərkəz")
  // We need to match by checking if the branch is in the ordersData keys
  const importedBranchIds = Object.keys(ordersData || {});

  // Branches to exclude from missing count (not required to import daily)
  const excludedBranchIds = ['Gəncə', 'Sea breeze'];

  const missingBranches = allBranches.filter(branch => {
    // Skip excluded branches
    if (excludedBranchIds.includes(branch.id)) {
      return false;
    }

    // Try multiple matching patterns
    const patterns = [
      `${branch.type} ${branch.name}`,  // "Coffemania Azadlıq"
      branch.id,                        // "Azadlıq"
      branch.name,                      // "Azadlıq"
      `Next ${branch.name}`,            // For Next branches with different format
      `Coffemania ${branch.name}`,      // For Coffemania branches
    ];

    // Check if ANY pattern matches an imported branch ID
    const isImported = patterns.some(pattern =>
      importedBranchIds.some(importedId =>
        importedId.toLowerCase() === pattern.toLowerCase()
      )
    );

    return !isImported;
  });

  // Debug logging
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

  const handleExportToExcel = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await exportToExcel(ordersData, productPrices, new Date());
    } catch (error) {
      Alert.alert(
        "Xəta",
        "Excel faylı yaradılarkən xəta baş verdi",
        [{ text: "OK" }],
        { cancelable: true }
      );
    }
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

                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <MaterialCommunityIcons
                      name="cash"
                      size={14}
                      color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)'}
                    />
                    <ThemedText
                      numberOfLines={1}
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)',
                      }}
                    >
                      {totalEarnings.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₼
                    </ThemedText>
                  </View>

                  {/* Missing Branches Indicator */}
                  {missingBranches.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setMissingBranchesExpanded(!missingBranchesExpanded);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="alert-circle"
                        size={12}
                        color="#FF6B6B"
                      />
                      <ThemedText
                        numberOfLines={1}
                        style={{
                          fontSize: 11,
                          fontWeight: '600',
                          color: '#FF6B6B',
                        }}
                      >
                        {missingBranches.length} şöbə qalıb
                      </ThemedText>
                      <MaterialCommunityIcons
                        name={missingBranchesExpanded ? "chevron-up" : "chevron-down"}
                        size={14}
                        color="#FF6B6B"
                      />
                    </TouchableOpacity>
                  )}
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
                onPress={handleExportToExcel}
                style={{
                  backgroundColor: '#1E7E34',
                  padding: 8,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <MaterialCommunityIcons
                  name="microsoft-excel"
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ThemedView>

      {/* Missing Branches Expansion */}
      {missingBranches.length > 0 && missingBranchesExpanded && (
        <ThemedView style={{
          marginHorizontal: 12,
          marginTop: 8,
          marginBottom: 4,
          borderRadius: 16,
          backgroundColor: isDark ? 'rgba(255, 107, 107, 0.08)' : 'rgba(255, 107, 107, 0.05)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 107, 107, 0.15)',
          overflow: 'hidden',
        }}>
          <View style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 107, 107, 0.1)',
          }}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={18}
              color="#FF6B6B"
            />
            <ThemedText style={{
              fontSize: 14,
              fontWeight: '600',
              color: isDark ? '#FF6B6B' : '#FF4444',
              flex: 1,
            }}>
              Məhsul göndərməyən şöbələr
            </ThemedText>
            <View style={{
              backgroundColor: isDark ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 107, 107, 0.15)',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
              <ThemedText style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#FF6B6B',
              }}>
                {missingBranches.length}
              </ThemedText>
            </View>
          </View>

          <View style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            gap: 6,
          }}>
            {missingBranches.map((branch) => (
              <View
                key={branch.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: isDark ? 'rgba(255, 107, 107, 0.05)' : 'rgba(255, 107, 107, 0.03)',
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 107, 107, 0.08)',
                }}
              >
                <MaterialCommunityIcons
                  name="store-remove"
                  size={16}
                  color={isDark ? 'rgba(255, 107, 107, 0.7)' : 'rgba(255, 68, 68, 0.7)'}
                />
                <ThemedText style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: '500',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(74, 53, 49, 0.9)',
                }}>
                  {branch.name}
                </ThemedText>
                <ThemedText style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: isDark ? 'rgba(255, 107, 107, 0.6)' : 'rgba(255, 68, 68, 0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  {branch.type}
                </ThemedText>
              </View>
            ))}
          </View>
        </ThemedView>
      )}

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