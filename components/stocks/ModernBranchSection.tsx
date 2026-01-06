import React, { useState, useRef, useMemo } from 'react';
import { TouchableOpacity, View, StyleSheet, Animated as RNAnimated, Platform, Modal, Pressable } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
import { Colors, PastryColors } from '@/constants/Colors';
import { colorScheme } from '@/constants/colorScheme';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

const parseQuantity = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const numMatch = value.match(/[\d.]+/);
    return numMatch ? parseFloat(numMatch[0]) : 0;
  }
  return 0;
};

interface ModernBranchSectionProps {
  branchName: string;
  products: Record<string, number>;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDeleteBranch: () => void;
  onAddProduct: () => void;
  onEditProduct: (productName: string, quantity: string) => void;
  onDeleteProduct: (productName: string) => void;
  productPrices?: Map<string, number>;
}

export const ModernBranchSection = ({
  branchName,
  products,
  isExpanded,
  onToggleExpand,
  onDeleteBranch,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  productPrices,
}: ModernBranchSectionProps) => {
  // Force light mode colors for consistency
  const isDark = false;
  const expandAnimation = useSharedValue(isExpanded ? 1 : 0);
  const [containerHeight] = useState(new RNAnimated.Value(0));
  const [showActionMenu, setShowActionMenu] = useState(false);

  const totalQuantity = useMemo(() => {
    return Object.values(products).reduce((sum, quantity) => sum + parseQuantity(quantity), 0);
  }, [products]);

  const productTypeCount = useMemo(() => {
    return Object.keys(products).length;
  }, [products]);

  const totalBranchPrice = useMemo(() => {
    if (!productPrices) return 0;
    let total = 0;
    Object.entries(products).forEach(([productName, quantity]) => {
      const normalizedProduct = productName.trim().toLowerCase();
      const productPrice = productPrices.get(normalizedProduct);
      if (productPrice !== undefined) {
        total += parseQuantity(quantity) * productPrice;
      }
    });
    return total;
  }, [products, productPrices]);

  React.useEffect(() => {
    expandAnimation.value = withSpring(isExpanded ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isExpanded]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    borderBottomWidth: interpolate(
      expandAnimation.value,
      [0, 1],
      [0, 1]
    ),
  }));

  const iconRotation = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(expandAnimation.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));


  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleExpand();
  };

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeMenu();
    onAddProduct();
  };

  const handleDeleteBranch = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    closeMenu();
    onDeleteBranch();
  };

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowActionMenu(true);
  };

  const closeMenu = () => {
    setShowActionMenu(false);
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: colorScheme.cardLight,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.header,
          headerAnimatedStyle,
          {
            borderBottomColor: isDark
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.03)',
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleToggle}
          style={styles.headerTouchable}
          activeOpacity={0.7}
        >
          <View style={[styles.headerContent, { backgroundColor: 'transparent' }]}>
            <ThemedView style={styles.branchInfo}>
              <ThemedText
                numberOfLines={2}
                ellipsizeMode="tail"
                style={[
                  styles.branchName,
                  {
                    color: colorScheme.textLight,
                  },
                ]}
              >
                {branchName}
              </ThemedText>
            </ThemedView>

            <View style={styles.rightSection}>
              <View style={styles.metaContainer}>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <ThemedText style={[styles.statLabel, { color: colorScheme.textSubtleLight }]}>
                      Toplam
                    </ThemedText>
                    <ThemedText style={[styles.statValue, { color: colorScheme.accentRed }]}>
                      {totalQuantity.toFixed(1)}
                    </ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={[styles.statLabel, { color: colorScheme.textSubtleLight }]}>
                      Növ
                    </ThemedText>
                    <ThemedText style={[styles.statValue, { color: colorScheme.accentRed }]}>
                      {productTypeCount}
                    </ThemedText>
                  </View>
                </View>

                {productPrices && totalBranchPrice > 0 && (
                  <View style={styles.priceRow}>
                    <ThemedText style={[styles.statLabel, { color: colorScheme.textSubtleLight }]}>
                      Qiymət
                    </ThemedText>
                    <ThemedText style={[styles.statValue, { color: colorScheme.accentRed }]}>
                      {totalBranchPrice.toFixed(2)} ₼
                    </ThemedText>
                  </View>
                )}
              </View>

              <View style={styles.actions}>
                <Animated.View style={[styles.expandButton, iconRotation]}>
                  <Feather
                    name="chevron-down"
                    size={20}
                    color={colorScheme.textLight}
                  />
                </Animated.View>

                <TouchableOpacity
                  onPress={handleMenuPress}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: colorScheme.lightRed,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="more-vertical"
                    size={18}
                    color={colorScheme.accentRed}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {isExpanded && (
        <ThemedView style={styles.productsContainer}>
          {Object.entries(products).map(([productName, quantity], index) => (
            <ProductItem
              key={productName}
              productName={productName}
              quantity={quantity}
              isDark={isDark}
              onEdit={() => onEditProduct(productName, quantity.toString())}
              onDelete={() => onDeleteProduct(productName)}
              isLast={index === Object.entries(products).length - 1}
            />
          ))}
        </ThemedView>
      )}

      {showActionMenu && (
        <Modal
          transparent={true}
          visible={showActionMenu}
          animationType="fade"
          statusBarTranslucent={true}
        >
          <View style={styles.backdrop}>
            {Platform.OS === 'ios' || Platform.OS === 'android' ? (
              <BlurView
                style={StyleSheet.absoluteFill}
                intensity={15}
                tint="dark"
              />
            ) : null}
          </View>

          <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />

          <View style={[styles.actionMenu, { top: '50%', marginTop: -100 }]}>
            <View style={[styles.menuHeader, {
              borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }]}>
              <ThemedText style={styles.menuTitle}>Filial Əməliyyatları</ThemedText>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                <Feather
                  name="x"
                  size={20}
                  color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={handleAddPress}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)' }]}>
                <AntDesign name="plus" size={20} color={isDark ? PastryColors.vanilla : PastryColors.chocolate} />
              </View>
              <ThemedText style={[styles.optionText, { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }]}>
                Yeni Məhsul Əlavə Et
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={handleDeleteBranch}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <AntDesign name="delete" size={20} color={Colors.danger} />
              </View>
              <ThemedText style={[styles.optionText, { color: Colors.danger }]}>
                Filiali Sil
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

    </ThemedView>

  );
};

const ProductItem = ({
  productName,
  quantity,
  isDark,
  onEdit,
  onDelete,
  isLast,
}: {
  productName: string;
  quantity: number;
  isDark: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isLast: boolean;
}) => {
  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEdit();
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete();
  };

  return (
    <View
      style={[
        styles.productItem,
        {
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: isDark
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.03)',
        },
      ]}
    >
      <View style={styles.productInfo}>
        <View
          style={[
            styles.productImagePlaceholder,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(74,53,49,0.06)',
            },
          ]}
        >
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={22}
            color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
          />
        </View>
        <View style={styles.productDetails}>
          <View style={styles.productTitleRow}>
            <ThemedText
              numberOfLines={1}
              style={[
                styles.productName,
                {
                  color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
                },
              ]}
            >
              {productName}
            </ThemedText>
            <View style={styles.quantityBadge}>
              <ThemedText
                style={[
                  styles.quantityText,
                  {
                    color: isDark
                      ? 'rgba(255,255,255,0.8)'
                      : 'rgba(0,0,0,0.7)',
                  },
                ]}
              >
                {quantity}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.productActions}>
        <TouchableOpacity
          onPress={handleEdit}
          style={[
            styles.actionButton,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(74,53,49,0.06)',
            },
          ]}
          activeOpacity={0.7}
        >
          <Feather
            name="edit-2"
            size={16}
            color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          style={[
            styles.actionButton,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(74,53,49,0.06)',
            },
          ]}
          activeOpacity={0.7}
        >
          <Feather
            name="trash-2"
            size={16}
            color={Colors.danger}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: colorScheme.accentRed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colorScheme.lightRed,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
    }),
  },
  header: {
    overflow: 'hidden',
  },
  headerTouchable: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'column',
    gap: 12,
    backgroundColor: 'transparent',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    flexShrink: 0,
  },
  metaContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  branchInfo: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  branchName: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
    ...Platform.select({
      ios: {
        fontWeight: '800',
      },
    }),
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexShrink: 0,
  },
  statItem: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colorScheme.accentRed,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colorScheme.textSubtleLight,
  },
  expandButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorScheme.lightRed,
  },
  productsContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  productImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
    flex: 1,
  },
  quantityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 6,
    gap: 0,
    minWidth: 50,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: colorScheme.accentRed,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  actionMenu: {
    position: 'absolute',
    left: '50%',
    marginLeft: -140,
    width: 280,
    backgroundColor: PastryColors.vanilla,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PastryColors.vanilla,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  bottomSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
