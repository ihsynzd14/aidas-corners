import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet, Animated as RNAnimated } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
import { Colors, PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';
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
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.06)',
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
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(74,53,49,0.05)',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="store"
                  size={24}
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
                <ThemedText
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.productCount,
                    {
                      color: isDark
                        ? 'rgba(255,255,255,0.6)'
                        : 'rgba(0,0,0,0.5)',
                    },
                  ]}
                >
                  {Object.keys(products).length} məhsul
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleAddPress}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(74,53,49,0.05)',
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
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(74,53,49,0.05)',
                  },
                ]}
                activeOpacity={0.7}
              >
                <AntDesign name="delete" size={20} color={Colors.danger} />
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.expandButton,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(74,53,49,0.05)',
                  },
                  iconRotation,
                ]}
              >
                <Feather
                  name="chevron-down"
                  size={20}
                  color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
                />
              </Animated.View>
            </View>
          </ThemedView>
        </TouchableOpacity>
      </Animated.View>

      {isExpanded && (
        <ThemedView style={styles.productsContainer}>
          {Object.entries(products).map(([product, quantity], index) => (
            <ProductItem
              key={product}
              product={product}
              quantity={quantity}
              isLast={index === Object.keys(products).length - 1}
              onEdit={() => onEditProduct(product, quantity.toString())}
              onDelete={() => onDeleteProduct(product)}
            />
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
};

interface ProductItemProps {
  product: string;
  quantity: number;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductItem = ({ product, quantity, isLast, onEdit, onDelete }: ProductItemProps) => {
  const isDark = useColorScheme() === 'dark';

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEdit();
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete();
  };

  return (
    <ThemedView
      style={[
        styles.productItem,
        {
          marginBottom: isLast ? 0 : 12,
          backgroundColor: isDark
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(74,53,49,0.03)',
        },
      ]}
    >
      <ThemedView style={styles.productInfo}>
        <MaterialCommunityIcons
          name="cookie"
          size={20}
          color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)'}
          style={styles.productIcon}
        />
        <ThemedText
          style={[
            styles.productName,
            {
              color: isDark ? PastryColors.vanilla : '#333',
            },
          ]}
        >
          {product}
        </ThemedText>
      </ThemedView>

      <View style={styles.productActions}>
        <ThemedView
          style={[
            styles.quantityBadge,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.15)'
                : 'rgba(74,53,49,0.07)',
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
        </ThemedView>

        <TouchableOpacity
          onPress={handleEdit}
          style={[
            styles.productActionButton,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(74,53,49,0.05)',
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
            styles.productActionButton,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(74,53,49,0.05)',
            },
          ]}
          activeOpacity={0.7}
        >
          <AntDesign name="delete" size={18} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    overflow: 'hidden',
  },
  headerTouchable: {
    padding: 16,
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
    maxWidth: '70%',
  },
  iconWrapper: {
    height: 44,
    width: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  textContainer: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  branchName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  productCount: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  actionButton: {
    padding: 10,
    borderRadius: 10,
  },
  expandButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productsContainer: {
    backgroundColor: 'transparent',
    padding: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
    backgroundColor: 'transparent',
  },
  productIcon: {
    marginRight: 12,
  },
  productName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 45,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
  },
  productActionButton: {
    padding: 8,
    borderRadius: 8,
  },
});
