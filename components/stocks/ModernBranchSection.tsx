import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet, Animated as RNAnimated, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
import { Colors, PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface ModernBranchSectionProps {
  branchName: string;
  products: Record<string, number>;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDeleteBranch: () => void;
  onAddProduct: () => void;
  onEditProduct: (productName: string, quantity: string) => void;
  onDeleteProduct: (productName: string) => void;
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
}: ModernBranchSectionProps) => {
  const isDark = useColorScheme() === 'dark';
  const expandAnimation = useSharedValue(isExpanded ? 1 : 0);
  const [containerHeight] = useState(new RNAnimated.Value(0));

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
    onAddProduct();
  };

  const handleDeleteBranch = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDeleteBranch();
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: isDark ? PastryColors.chocolate : PastryColors.vanilla,
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
          <ThemedView style={styles.headerContent}>
            <ThemedView style={styles.branchInfo}>
              <ThemedView
                style={[
                  styles.iconWrapper,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(74,53,49,0.04)',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="store"
                  size={26}
                  color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
                />
              </ThemedView>

              <ThemedView style={styles.textContainer}>
                <ThemedText
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={[
                    styles.branchName,
                    {
                      color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
                    },
                  ]}
                >
                  {branchName}
                </ThemedText>
                <ThemedView style={styles.countBadge}>
                  <ThemedText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                      styles.productCount,
                      {
                        color: isDark
                          ? 'rgba(255,255,255,0.7)'
                          : 'rgba(0,0,0,0.6)',
                      },
                    ]}
                  >
                    {Object.keys(products).length} məhsul
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleAddPress}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(74,53,49,0.04)',
                  },
                ]}
                activeOpacity={0.7}
              >
                <AntDesign
                  name="plus"
                  size={20}
                  color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteBranch}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(74,53,49,0.04)',
                  },
                ]}
                activeOpacity={0.7}
              >
                <AntDesign name="delete" size={20} color={Colors.danger} />
              </TouchableOpacity>

              <Animated.View style={[styles.expandButton, iconRotation]}>
                <Feather
                  name="chevron-down"
                  size={22}
                  color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
                />
              </Animated.View>
            </View>
          </ThemedView>
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
            styles.productIconBadge,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(74,53,49,0.06)',
            },
          ]}
        >
          <MaterialCommunityIcons
            name="cake-variant"
            size={20}
            color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
          />
        </View>
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
      </View>

      <View style={styles.productActions}>
        <View
          style={[
            styles.quantityChip,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(74,53,49,0.08)',
            },
          ]}
        >
          <ThemedText
            style={[
              styles.quantityText,
              {
                color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
              },
            ]}
          >
            {quantity}
          </ThemedText>
        </View>

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
          <AntDesign
            name="edit"
            size={18}
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
          <AntDesign name="delete" size={18} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
    }),
  },
  header: {
    overflow: 'hidden',
  },
  headerTouchable: {
    padding: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  branchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
    backgroundColor: 'transparent',
  },
  iconWrapper: {
    height: 52,
    width: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  textContainer: {
    backgroundColor: 'transparent',
    flex: 1,
    gap: 6,
  },
  branchName: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
    ...Platform.select({
      ios: {
        fontWeight: '700',
      },
    }),
  },
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
  },
  productCount: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  expandButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productsContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  productIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    letterSpacing: 0.2,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
