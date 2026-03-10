import React, { useState, Dispatch, SetStateAction } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colorScheme } from '@/constants/colorScheme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MultiSelectBottomSheet } from './MultiSelectBottomSheet';
import { ProductStats, DailyStats } from './ProductStatisticsLogic';

interface DailyViewProps {
  selectedProducts: string[];
  selectedBranches: string[];
  productStats: ProductStats[];
  dailyStats: DailyStats[];
  setSelectedProducts: Dispatch<SetStateAction<string[]>>;
  setSelectedBranches: Dispatch<SetStateAction<string[]>>;
}

export const DailyView: React.FC<DailyViewProps> = ({
  selectedProducts,
  selectedBranches,
  productStats,
  dailyStats,
  setSelectedProducts,
  setSelectedBranches,
}) => {
  const isDark = useColorScheme() === 'dark';
  const cardBg = isDark ? colorScheme.cardDark : colorScheme.cardLight;
  const textColor = isDark ? colorScheme.textDark : colorScheme.textLight;
  const secondaryTextColor = isDark ? colorScheme.textSubtleDark : colorScheme.textSubtleLight;
  const borderColor = isDark ? colorScheme.borderRed : colorScheme.borderRed;
  const shadowColor = colorScheme.accentRed;
  const activeColor = colorScheme.primary; 
  const inactiveBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';

  const [branchSheetVisible, setBranchSheetVisible] = useState(false);
  const [productSheetVisible, setProductSheetVisible] = useState(false);
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const toggleBranchExpand = (key: string) => {
    setExpandedBranches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const toggleDateExpand = (date: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const formatQuantity = (quantity: number) => {
    if (!quantity || quantity === 0) return null;
    return quantity % 1 === 0 ? Math.round(quantity).toString() : quantity.toFixed(1);
  };

  // Get all unique branches
  const uniqueBranches = React.useMemo(() => {
    return Array.from(productStats.reduce((acc, stat) => {
      Object.keys(stat.branchStats).forEach(branch => acc.add(branch));
      return acc;
    }, new Set<string>()));
  }, [productStats]);

  const branchOptions = uniqueBranches.map(branch => ({ id: branch, label: branch }));
  const productOptions = productStats.map(product => ({ id: product.productName, label: product.productName }));

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 150 }}>
      {/* Filters Section */}
      <View style={{ marginBottom: 24, flexDirection: 'row', gap: 12 }}>
        
        {/* Branch Selection Button */}
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: cardBg, borderColor: borderColor }]}
          onPress={() => setBranchSheetVisible(true)}
        >
          <View style={styles.filterIconContainer}>
            <MaterialCommunityIcons name="store" size={20} color={colorScheme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.filterLabel, { color: secondaryTextColor }]}>FİLİALLAR</ThemedText>
            <ThemedText style={[styles.filterValue, { color: textColor }]} numberOfLines={1}>
              {selectedBranches?.length > 0 
                ? `${selectedBranches.length} filial seçilib` 
                : 'Filial seçin'}
            </ThemedText>
          </View>
          <Ionicons name="chevron-down" size={16} color={secondaryTextColor} />
        </TouchableOpacity>

        {/* Product Selection Button */}
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: cardBg, borderColor: borderColor }]}
          onPress={() => setProductSheetVisible(true)}
        >
          <View style={styles.filterIconContainer}>
            <MaterialCommunityIcons name="tag" size={20} color={colorScheme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.filterLabel, { color: secondaryTextColor }]}>MƏHSULLAR</ThemedText>
            <ThemedText style={[styles.filterValue, { color: textColor }]} numberOfLines={1}>
              {selectedProducts?.length > 0 
                ? `${selectedProducts.length} məhsul seçilib` 
                : 'Hamsı'}
            </ThemedText>
          </View>
          <Ionicons name="chevron-down" size={16} color={secondaryTextColor} />
        </TouchableOpacity>
      </View>

      <MultiSelectBottomSheet
        visible={branchSheetVisible}
        title="Filial Seçimi"
        options={branchOptions}
        selectedValues={selectedBranches}
        onConfirm={setSelectedBranches}
        onClose={() => setBranchSheetVisible(false)}
      />

      <MultiSelectBottomSheet
        visible={productSheetVisible}
        title="Məhsul Seçimi"
        options={productOptions}
        selectedValues={selectedProducts}
        onConfirm={setSelectedProducts}
        onClose={() => setProductSheetVisible(false)}
      />

      {/* Results Section */}
      {selectedBranches?.length > 0 && (
        <View style={{ marginTop: 8 }}>
          <View style={{ marginBottom: 16, paddingHorizontal: 4 }}>
            <ThemedText style={[styles.sectionTitleModern, { color: secondaryTextColor, marginBottom: 4 }]}>
              GÜNLÜK STATİSTİKA
            </ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <ThemedText style={{ fontSize: 13, color: secondaryTextColor }}>
                {dailyStats.filter(stat => formatQuantity(stat.quantity)).length} məlumat tapıldı
              </ThemedText>
              <ThemedText style={{ fontSize: 14, fontWeight: '700', color: colorScheme.primary }}>
                Ümumi: {dailyStats.reduce((sum, s) => sum + (s.price ? s.quantity * s.price : 0), 0).toFixed(2)} ₼
              </ThemedText>
            </View>
          </View>

          {(() => {
            // Group stats by date -> branch
            const groupedStats = dailyStats.reduce((acc, stat) => {
              if (!acc[stat.date]) {
                acc[stat.date] = {};
              }
              if (!acc[stat.date][stat.branchName]) {
                acc[stat.date][stat.branchName] = [];
              }
              acc[stat.date][stat.branchName].push(stat);
              return acc;
            }, {} as { [date: string]: { [branch: string]: DailyStats[] } });

            // Sort dates (newest first)
            const sortedDates = Object.keys(groupedStats).sort((a, b) => {
              const [aDay, aMonth, aYear] = a.split('.').map(Number);
              const [bDay, bMonth, bYear] = b.split('.').map(Number);
              return new Date(bYear, bMonth - 1, bDay).getTime() - new Date(aYear, aMonth - 1, aDay).getTime();
            });

            return sortedDates.map((date) => {
              const dateBranches = groupedStats[date];
              const sortedBranches = Object.keys(dateBranches).sort(); // Sort branches alphabetically
              const isDateExpanded = expandedDates.has(date);

              // Calculate Date Totals
              let dateTotalEarnings = 0;
              let dateTotalQuantity = 0;

              sortedBranches.forEach(branch => {
                dateBranches[branch].forEach(s => {
                  dateTotalEarnings += (s.price ? s.quantity * s.price : 0);
                  dateTotalQuantity += s.quantity;
                });
              });

              return (
                <View key={date} style={[
                  styles.dayCard,
                  { 
                    backgroundColor: cardBg,
                    borderColor: borderColor,
                    borderWidth: 1,
                    marginBottom: 16 // Explicit margin between cards
                  }
                ]}>
                  {/* Day Header */}
                  <TouchableOpacity 
                    style={[
                      styles.dayHeader, 
                      { borderBottomColor: isDateExpanded ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent' }
                    ]}
                    onPress={() => toggleDateExpand(date)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <MaterialCommunityIcons 
                        name={isDateExpanded ? "chevron-down" : "chevron-right"} 
                        size={22} 
                        color={colorScheme.accentRedlight} 
                      />
                      <ThemedText style={{ fontWeight: '700', fontSize: 16, color: textColor }}>{date}</ThemedText>
                    </View>
                    <View>
                      <ThemedText style={{ fontSize: 14, fontWeight: '700', color: colorScheme.primary, textAlign: 'right' }}>
                        {dateTotalEarnings.toFixed(2)} ₼
                      </ThemedText>
                      <ThemedText style={{ fontSize: 12, color: secondaryTextColor, textAlign: 'right' }}>
                        {formatQuantity(dateTotalQuantity)} ədəd
                      </ThemedText>
                    </View>
                  </TouchableOpacity>

                  {/* Branches List */}
                  {isDateExpanded && (
                    <View style={styles.dayContent}>
                      {sortedBranches.map((branch, branchIndex) => {
                        const branchStats = dateBranches[branch];
                        const branchTotalEarnings = branchStats.reduce((sum, s) => sum + (s.price ? s.quantity * s.price : 0), 0);
                        const branchTotalQuantity = branchStats.reduce((sum, s) => sum + s.quantity, 0);
                        const collapseKey = `${date}-${branch}`;
                        const isBranchExpanded = expandedBranches.has(collapseKey);
                        
                        return (
                          <View key={branch} style={{ marginBottom: branchIndex === sortedBranches.length - 1 ? 0 : 16 }}>
                            {/* Branch Header */}
                            <TouchableOpacity 
                              onPress={() => toggleBranchExpand(collapseKey)}
                              activeOpacity={0.7}
                              style={[
                                styles.branchHeader, 
                                { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }
                              ]}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <MaterialCommunityIcons 
                                  name={isBranchExpanded ? "chevron-down" : "chevron-right"} 
                                  size={20} 
                                  color={secondaryTextColor} 
                                />
                                <MaterialCommunityIcons name="store" size={16} color={secondaryTextColor} />
                                <ThemedText style={{ fontSize: 13, fontWeight: '600', color: textColor }}>
                                  {branch}
                                </ThemedText>
                              </View>
                              <ThemedText style={{ fontSize: 13, fontWeight: '600', color: textColor }}>
                                {branchTotalEarnings.toFixed(2)} ₼
                              </ThemedText>
                            </TouchableOpacity>

                            {/* Products in Branch */}
                            {isBranchExpanded && (
                              <View style={styles.branchContent}>
                                {branchStats.map((stat, index) => {
                                  const itemEarnings = stat.price ? stat.quantity * stat.price : 0;
                                  return (
                                    <View key={index} style={[
                                      styles.itemRow,
                                      index !== branchStats.length - 1 && { 
                                        borderBottomWidth: 1, 
                                        borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' 
                                      }
                                    ]}>
                                      <View style={{ flex: 1 }}>
                                        <ThemedText style={{ fontSize: 14, fontWeight: '500', color: textColor }}>
                                          {stat.productName}
                                        </ThemedText>
                                      </View>
                                      
                                      <View style={{ alignItems: 'flex-end' }}>
                                        <ThemedText style={{ fontSize: 13, fontWeight: '500', color: secondaryTextColor }}>
                                          {formatQuantity(stat.quantity)} x {stat.price ? stat.price.toFixed(2) : '-'}
                                        </ThemedText>
                                        <ThemedText style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#4ade80' : '#16a34a' }}>
                                          {itemEarnings.toFixed(2)} ₼
                                        </ThemedText>
                                      </View>
                                    </View>
                                  );
                                })}
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            });
          })()}
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
  sectionTitleModern: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  filterIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  filterValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  dayCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  dayContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  branchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  branchContent: {
    paddingHorizontal: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  cell: {
    fontSize: 13,
    textAlign: 'center',
  },
});