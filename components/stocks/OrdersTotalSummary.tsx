import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { TouchableOpacity, FlatList, View, Alert, Text, Dimensions, StyleSheet, Platform } from 'react-native';
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
import { getBranches, getProductCorrections, buildPriceHistoryMap, getEffectivePrice } from '@/utils/firebase';
import { exportToExcel } from '@/utils/excelExport';
import { Branch } from '@/types/branch';

// ============================================================================
// DESIGN SYSTEM CONSTANTS
// ============================================================================
const DESIGN_TOKENS = {
  spacing: {
    xs: 3,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 16,
    xxl: 20,
  },
  typography: {
    xs: 10,
    sm: 11,
    md: 12,
    lg: 13,
    xl: 14,
    xxl: 15,
    display: 18,
  },
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 10,
    xl: 12,
    xxl: 16,
  },
  opacity: {
    subtle: 0.4,
    medium: 0.6,
    strong: 0.8,
    full: 1,
  },
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================
const BREAKPOINTS = {
  small: 320,
  medium: 375,
  large: 414,
  tablet: 768,
} as const;

// ============================================================================
// ACCESSIBILITY LABELS
// ============================================================================
const ACCESSIBILITY_LABELS = {
  shareWhatsApp: 'WhatsApp ilə paylaş',
  shareByRegions: 'Bölgələrə görə WhatsApp ilə paylaş',
  exportExcel: 'Excel faylı kimi ixrac et',
  missingBranches: 'Məhsul göndərməyən şöbələri göstər',
  expandMissing: 'Məhsul göndərməyən şöbələri genişləndir',
  collapseMissing: 'Məhsul göndərməyən şöbələri yığışdır',
  filterToggle: 'Sıralama seçimlərini göstər',
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const getResponsiveValue = (
  value: number,
  screenWidth: number
): number => {
  const ratio = screenWidth / 375; // Base width (iPhone 12)
  return Math.max(value * 0.75, Math.min(value * 1.2, value * ratio));
};

const formatLargeNumber = (num: number, screenWidth: number): string => {
  const formatted = num.toLocaleString('az-AZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Truncate for very small screens if needed
  if (screenWidth < 340 && formatted.length > 12) {
    return formatted.substring(0, 10) + '...';
  }

  return formatted;
};

// ============================================================================
// STYLES
// ============================================================================
const createStyles = (isDark: boolean, screenWidth: number) => {
  const spacing = DESIGN_TOKENS.spacing;
  const typography = DESIGN_TOKENS.typography;
  const borderRadius = DESIGN_TOKENS.borderRadius;

  const responsivePadding = getResponsiveValue(spacing.xl, screenWidth);
  const responsiveGap = getResponsiveValue(spacing.md, screenWidth);
  const responsiveTitleSize = getResponsiveValue(typography.display, screenWidth);
  const responsiveStatSize = getResponsiveValue(typography.md, screenWidth);

  return StyleSheet.create({
    headerContainer: {
      backgroundColor: isDark ? PastryColors.chocolate : PastryColors.vanilla,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
      paddingBottom: Platform.select({ ios: 2, android: 1 }),
    },
    headerInner: {
      padding: responsivePadding,
      flexDirection: 'column',
      gap: responsiveGap,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      width: '100%',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: responsiveGap,
      backgroundColor: 'transparent',
      flex: 1,
      marginRight: spacing.sm,
    },
    iconContainer: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.07)',
      padding: spacing.xs,
      borderRadius: borderRadius.sm,
      flexShrink: 0,
    },
    titleContainer: {
      backgroundColor: 'transparent',
      gap: spacing.xs,
      flex: 1,
      minWidth: 0, // Important for text truncation
    },
    titleText: {
      fontSize: responsiveTitleSize,
      fontWeight: '600' as const,
      color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
    },
    statsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
      gap: spacing.sm,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    statText: {
      fontSize: responsiveStatSize,
      fontWeight: '600' as const,
      color: isDark ? `rgba(255,255,255,${DESIGN_TOKENS.opacity.medium})` : `rgba(74,53,49,${DESIGN_TOKENS.opacity.medium})`,
    },
    statTextEarnings: {
      fontSize: getResponsiveValue(typography.lg, screenWidth),
      fontWeight: '700' as const,
    },
    missingBranchesIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    missingBranchesText: {
      fontSize: getResponsiveValue(typography.xs, screenWidth),
      fontWeight: '600' as const,
      color: '#FF6B6B',
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
      flexShrink: 0,
    },
    actionButton: {
      padding: spacing.xs,
      borderRadius: borderRadius.xl,
      flexDirection: 'row' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 32,
      minHeight: 32,
    },
    actionButtonWhatsApp: {
      backgroundColor: '#25D366',
    },
    actionButtonRegions: {
      backgroundColor: '#FFD700',
    },
    actionButtonExcel: {
      backgroundColor: '#1E7E34',
    },
  });
};

interface BranchQuantity {
  branchName: string;
  quantity: number;
}

interface OrdersTotalSummaryProps {
  ordersData: any;
  SHEET_HEIGHT: number;
  scrollRef: React.RefObject<any>;
  selectedDate?: Date;
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

// ============================================================================
// RESPONSIVE HEADER COMPONENT
// ============================================================================
interface HeaderProps {
  totalProducts: number;
  totalQuantity: number;
  totalBranches: number;
  totalEarnings: number;
  missingBranches: Branch[];
  missingBranchesExpanded: boolean;
  onToggleMissingBranches: () => void;
  onShareWhatsApp: () => void;
  onShareByRegions: () => void;
  onExportExcel: () => void;
  isDark: boolean;
  screenWidth: number;
}

const HeaderSection = React.memo<HeaderProps>(({
  totalProducts,
  totalQuantity,
  totalBranches,
  totalEarnings,
  missingBranches,
  missingBranchesExpanded,
  onToggleMissingBranches,
  onShareWhatsApp,
  onShareByRegions,
  onExportExcel,
  isDark,
  screenWidth,
}) => {
  const styles = useMemo(() => createStyles(isDark, screenWidth), [isDark, screenWidth]);
  const [dimensions, setDimensions] = useState({ width: screenWidth, height: 0 });

  // Handle screen resize
  const handleLayout = useCallback((event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  }, []);

  // Determine if we should show compact layout
  const isCompact = dimensions.width < BREAKPOINTS.small;
  const showEarningsInline = dimensions.width > BREAKPOINTS.medium;

  return (
    <ThemedView style={styles.headerContainer} onLayout={handleLayout}>
      <View style={styles.headerInner}>
        <View style={styles.headerRow}>
          {/* Left Section: Title and Stats */}
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="chart-box"
                size={getResponsiveValue(20, screenWidth)}
                color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
              />
            </View>
            <View style={styles.titleContainer}>
              <ThemedText
                numberOfLines={1}
                style={styles.titleText}
              >
                Ümumi Cəm
              </ThemedText>

              {/* Stats Row */}
              <View style={styles.statsContainer}>
                {/* Products Count */}
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={getResponsiveValue(12, screenWidth)}
                    color={isDark ? `rgba(255,255,255,${DESIGN_TOKENS.opacity.medium})` : `rgba(74,53,49,${DESIGN_TOKENS.opacity.medium})`}
                  />
                  <ThemedText
                    numberOfLines={1}
                    style={styles.statText}
                  >
                    {totalProducts} növ
                  </ThemedText>
                </View>

                {/* Quantity Count */}
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="pound"
                    size={getResponsiveValue(12, screenWidth)}
                    color={isDark ? `rgba(255,255,255,${DESIGN_TOKENS.opacity.medium})` : `rgba(74,53,49,${DESIGN_TOKENS.opacity.medium})`}
                  />
                  <ThemedText
                    numberOfLines={1}
                    style={styles.statText}
                  >
                    {totalQuantity.toFixed(2)} ədəd
                  </ThemedText>
                </View>

                {/* Branches Count */}
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="store"
                    size={getResponsiveValue(12, screenWidth)}
                    color={isDark ? `rgba(255,255,255,${DESIGN_TOKENS.opacity.medium})` : `rgba(74,53,49,${DESIGN_TOKENS.opacity.medium})`}
                  />
                  <ThemedText
                    numberOfLines={1}
                    style={styles.statText}
                  >
                    {totalBranches} şöbə
                  </ThemedText>
                </View>

                {/* Earnings - Conditional Rendering based on screen size */}
                {showEarningsInline && (
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons
                      name="cash"
                      size={getResponsiveValue(12, screenWidth)}
                      color={isDark ? `rgba(255,255,255,${DESIGN_TOKENS.opacity.medium})` : `rgba(74,53,49,${DESIGN_TOKENS.opacity.medium})`}
                    />
                    <ThemedText
                      numberOfLines={1}
                      style={[styles.statText, styles.statTextEarnings]}
                    >
                      {formatLargeNumber(totalEarnings, screenWidth)} ₼
                    </ThemedText>
                  </View>
                )}

                {/* Missing Branches Indicator */}
                {missingBranches.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onToggleMissingBranches();
                    }}
                    style={styles.missingBranchesIndicator}
                    activeOpacity={0.7}
                    accessibilityLabel={missingBranchesExpanded ? ACCESSIBILITY_LABELS.collapseMissing : ACCESSIBILITY_LABELS.expandMissing}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: missingBranchesExpanded }}
                  >
                    <MaterialCommunityIcons
                      name="alert-circle"
                      size={getResponsiveValue(10, screenWidth)}
                      color="#FF6B6B"
                    />
                    <ThemedText
                      numberOfLines={1}
                      style={styles.missingBranchesText}
                    >
                      {missingBranches.length} şöbə qalıb
                    </ThemedText>
                    <MaterialCommunityIcons
                      name={missingBranchesExpanded ? "chevron-up" : "chevron-down"}
                      size={getResponsiveValue(12, screenWidth)}
                      color="#FF6B6B"
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Earnings shown below stats on small screens */}
              {!showEarningsInline && (
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="cash"
                    size={getResponsiveValue(14, screenWidth)}
                    color={isDark ? `rgba(255,255,255,${DESIGN_TOKENS.opacity.medium})` : `rgba(74,53,49,${DESIGN_TOKENS.opacity.medium})`}
                  />
                  <ThemedText
                    numberOfLines={1}
                    style={[styles.statText, styles.statTextEarnings]}
                  >
                    {formatLargeNumber(totalEarnings, screenWidth)} ₼
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Right Section: Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              onPress={onShareWhatsApp}
              style={[styles.actionButton, styles.actionButtonWhatsApp]}
              accessibilityLabel={ACCESSIBILITY_LABELS.shareWhatsApp}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="whatsapp"
                size={getResponsiveValue(18, screenWidth)}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onShareByRegions}
              style={[styles.actionButton, styles.actionButtonRegions]}
              accessibilityLabel={ACCESSIBILITY_LABELS.shareByRegions}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="whatsapp"
                size={getResponsiveValue(18, screenWidth)}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onExportExcel}
              style={[styles.actionButton, styles.actionButtonExcel]}
              accessibilityLabel={ACCESSIBILITY_LABELS.exportExcel}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="microsoft-excel"
                size={getResponsiveValue(18, screenWidth)}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ThemedView>
  );
});

// ============================================================================
// MISSING BRANCHES EXPANSION COMPONENT
// ============================================================================
interface MissingBranchesExpansionProps {
  missingBranches: Branch[];
  isExpanded: boolean;
  isDark: boolean;
  screenWidth: number;
}

const MissingBranchesExpansion = React.memo<MissingBranchesExpansionProps>(({
  missingBranches,
  isExpanded,
  isDark,
  screenWidth,
}) => {
  if (!isExpanded || missingBranches.length === 0) return null;

  const spacing = DESIGN_TOKENS.spacing;
  const borderRadius = DESIGN_TOKENS.borderRadius;

  return (
    <ThemedView style={{
      marginHorizontal: getResponsiveValue(spacing.md, screenWidth),
      marginTop: getResponsiveValue(spacing.sm, screenWidth),
      marginBottom: getResponsiveValue(spacing.xs, screenWidth),
      borderRadius: getResponsiveValue(borderRadius.xl, screenWidth),
      backgroundColor: isDark ? 'rgba(255, 107, 107, 0.08)' : 'rgba(255, 107, 107, 0.05)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 107, 107, 0.15)',
      overflow: 'hidden',
    }}>
      <View style={{
        paddingVertical: getResponsiveValue(10, screenWidth),
        paddingHorizontal: getResponsiveValue(14, screenWidth),
        flexDirection: 'row',
        alignItems: 'center',
        gap: getResponsiveValue(10, screenWidth),
        borderBottomWidth: 1,
        borderBottomColor: isDark ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 107, 107, 0.1)',
      }}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={getResponsiveValue(16, screenWidth)}
          color="#FF6B6B"
        />
        <ThemedText style={{
          fontSize: getResponsiveValue(DESIGN_TOKENS.typography.lg, screenWidth),
          fontWeight: '600',
          color: isDark ? '#FF6B6B' : '#FF4444',
          flex: 1,
        }}>
          Məhsul göndərməyən şöbələr
        </ThemedText>
        <View style={{
          backgroundColor: isDark ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 107, 107, 0.15)',
          paddingHorizontal: getResponsiveValue(10, screenWidth),
          paddingVertical: 4,
          borderRadius: getResponsiveValue(12, screenWidth),
        }}>
          <ThemedText style={{
            fontSize: getResponsiveValue(DESIGN_TOKENS.typography.sm, screenWidth),
            fontWeight: '700',
            color: '#FF6B6B',
          }}>
            {missingBranches.length}
          </ThemedText>
        </View>
      </View>

      <View style={{
        paddingVertical: getResponsiveValue(8, screenWidth),
        paddingHorizontal: getResponsiveValue(12, screenWidth),
        gap: getResponsiveValue(6, screenWidth),
      }}>
        {missingBranches.map((branch) => (
          <View
            key={branch.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: getResponsiveValue(10, screenWidth),
              paddingVertical: getResponsiveValue(8, screenWidth),
              paddingHorizontal: getResponsiveValue(12, screenWidth),
              backgroundColor: isDark ? 'rgba(255, 107, 107, 0.05)' : 'rgba(255, 107, 107, 0.03)',
              borderRadius: getResponsiveValue(borderRadius.sm, screenWidth),
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 107, 107, 0.08)',
            }}
          >
            <MaterialCommunityIcons
              name="store-remove"
              size={getResponsiveValue(14, screenWidth)}
              color={isDark ? 'rgba(255, 107, 107, 0.7)' : 'rgba(255, 68, 68, 0.7)'}
            />
            <ThemedText style={{
              flex: 1,
              fontSize: getResponsiveValue(DESIGN_TOKENS.typography.lg, screenWidth),
              fontWeight: '500',
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(74, 53, 49, 0.9)',
            }}>
              {branch.name}
            </ThemedText>
            <ThemedText style={{
              fontSize: getResponsiveValue(DESIGN_TOKENS.typography.xs, screenWidth),
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
  );
});

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
export function OrdersTotalSummary({ ordersData, SHEET_HEIGHT, scrollRef, selectedDate }: OrdersTotalSummaryProps) {
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

  // Fetch product prices (date-aware) and calculate total earnings
  useEffect(() => {
    const fetchProductPrices = async () => {
      try {
        const productCorrections = await getProductCorrections();
        const priceHistoryMap = buildPriceHistoryMap(productCorrections);
        // Tarix konteksti: seçilmiş tarix və ya bugün
        const orderDate = selectedDate || new Date();

        // Tarix üçün effektiv qiymət xəritəsi yarat
        const priceMap = new Map<string, number>();

        console.log('=== OrdersTotalSummary - Price Calculation (date-aware) ===');
        console.log('Order date:', orderDate.toISOString());

        priceHistoryMap.forEach((history, productName) => {
          const effectivePrice = getEffectivePrice(history, orderDate);
          if (effectivePrice !== undefined) {
            priceMap.set(productName, effectivePrice);
          }
        });
        setProductPrices(priceMap);

        console.log('Price Map built with', priceMap.size, 'entries');

        // Calculate total earnings from ordersData
        if (ordersData) {
          let earnings = 0;

          Object.entries(ordersData).forEach(([branchName, branchProducts]: [string, any]) => {
            Object.entries(branchProducts).forEach(([product, quantity]) => {
              const normalizedProduct = product.trim().toLowerCase();
              const productPrice = priceMap.get(normalizedProduct);
              const qty = parseFloat(quantity as string);

              if (productPrice !== undefined) {
                earnings += qty * productPrice;
              }
            });
          });

          setTotalEarnings(earnings);
        } else {
          setTotalEarnings(0);
        }
      } catch (error) {
        console.error('Error fetching product prices:', error);
      }
    };
    fetchProductPrices();
  }, [ordersData, selectedDate]);

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
      await exportToExcel(ordersData, productPrices, selectedDate || new Date());
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

  // Get screen width for responsive calculations
  const screenWidth = Dimensions.get('window').width;

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Responsive Header Section */}
      <HeaderSection
        totalProducts={totalProducts}
        totalQuantity={totalQuantity}
        totalBranches={totalBranches}
        totalEarnings={totalEarnings}
        missingBranches={missingBranches}
        missingBranchesExpanded={missingBranchesExpanded}
        onToggleMissingBranches={() => setMissingBranchesExpanded(!missingBranchesExpanded)}
        onShareWhatsApp={() => {
          const message = formatWhatsAppMessage(totals, totalProducts, totalQuantity, totalBranches);
          shareViaWhatsApp(message);
        }}
        onShareByRegions={handleShareByRegions}
        onExportExcel={handleExportToExcel}
        isDark={isDark}
        screenWidth={screenWidth}
      />

      {/* Missing Branches Expansion */}
      <MissingBranchesExpansion
        missingBranches={missingBranches}
        isExpanded={missingBranchesExpanded}
        isDark={isDark}
        screenWidth={screenWidth}
      />

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
            total={parseFloat(total.toFixed(2))}
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