import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors, PastryColors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface ProductSelectorProps {
  availableProducts: string[];
  selectedProducts: string[];
  selectAll: boolean;
  onProductToggle: (productName: string) => void;
  onSelectAll: () => void;
}

export function ProductSelector({
  availableProducts,
  selectedProducts,
  selectAll,
  onProductToggle,
  onSelectAll
}: ProductSelectorProps) {
  const isDark = useColorScheme() === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return availableProducts;
    
    return availableProducts.filter(product =>
      product.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableProducts, searchQuery]);

  const displayedProducts = isExpanded ? filteredProducts : filteredProducts.slice(0, 6);
  const hasMoreProducts = filteredProducts.length > 6;

  return (
    <ThemedView style={[
      styles.container,
      {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      }
    ]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons
            name="package-variant"
            size={20}
            color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
          />
          <ThemedText style={[
            styles.title,
            { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
          ]}>
            Məhsul Seçimi
          </ThemedText>
          <View style={[
            styles.badge,
            {
              backgroundColor: isDark ? PastryColors.primary : PastryColors.primary,
            }
          ]}>
            <ThemedText style={[
              styles.badgeText,
              { color: 'white' }
            ]}>
              {selectedProducts.length}/{availableProducts.length}
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.selectAllButton,
            {
              backgroundColor: selectAll 
                ? (isDark ? PastryColors.primary : PastryColors.primary)
                : 'transparent',
              borderColor: isDark ? PastryColors.primary : PastryColors.primary,
            }
          ]}
          onPress={onSelectAll}
        >
          <MaterialCommunityIcons
            name={selectAll ? "check-all" : "select-all"}
            size={16}
            color={selectAll ? 'white' : (isDark ? PastryColors.primary : PastryColors.primary)}
          />
          <ThemedText style={[
            styles.selectAllText,
            { 
              color: selectAll ? 'white' : (isDark ? PastryColors.primary : PastryColors.primary)
            }
          ]}>
            {selectAll ? 'Hamısını Sil' : 'Hamısını Seç'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={[
        styles.searchContainer,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
        }
      ]}>
        <MaterialCommunityIcons
          name="magnify"
          size={18}
          color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)'}
        />
        <TextInput
          style={[
            styles.searchInput,
            { 
              color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
            }
          ]}
          placeholder="Məhsul axtar..."
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(74,53,49,0.4)'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Products Grid */}
      <View style={styles.productsContainer}>
        <View style={styles.productsGrid}>
          {displayedProducts.map((product) => {
            const isSelected = selectedProducts.includes(product);
            return (
              <TouchableOpacity
                key={product}
                style={[
                  styles.productChip,
                  {
                    backgroundColor: isSelected
                      ? PastryColors.primary
                      : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.95)'),
                    borderColor: isSelected
                      ? PastryColors.primary
                      : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)'),
                  }
                ]}
                onPress={() => onProductToggle(product)}
              >
                <MaterialCommunityIcons
                  name={isSelected ? "check-circle" : "circle-outline"}
                  size={16}
                  color={isSelected ? 'white' : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)')}
                />
                <ThemedText 
                  style={[
                    styles.productText,
                    { 
                      color: isSelected ? '#FFFFFF' : (isDark ? PastryColors.vanilla : PastryColors.chocolate),
                    }
                  ]}
                  numberOfLines={1}
                >
                  {product}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Expand/Collapse Button */}
        {hasMoreProducts && (
          <TouchableOpacity
            style={[
              styles.expandButton,
              {
                backgroundColor: isDark ? 'rgba(255,148,148,0.1)' : 'rgba(255,148,148,0.1)',
                borderColor: isDark ? 'rgba(255,148,148,0.3)' : 'rgba(255,148,148,0.3)',
              }
            ]}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <MaterialCommunityIcons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={isDark ? PastryColors.primary : PastryColors.chocolate}
            />
            <ThemedText style={[
              styles.expandText,
              { color: isDark ? PastryColors.primary : PastryColors.chocolate }
            ]}>
              {isExpanded 
                ? 'Daha az göstər' 
                : `Daha çox göstər (+${filteredProducts.length - 6})`
              }
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* No Results */}
      {filteredProducts.length === 0 && searchQuery.length > 0 && (
        <View style={styles.noResultsContainer}>
          <MaterialCommunityIcons
            name="package-variant"
            size={32}
            color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(74,53,49,0.3)'}
          />
          <ThemedText style={[
            styles.noResultsText,
            { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)' }
          ]}>
            "{searchQuery}" üçün nəticə tapılmadı
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  selectAllText: {
    fontSize: 12,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  productsContainer: {
    gap: 12,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    minWidth: screenWidth * 0.25,
    maxWidth: screenWidth * 0.45,
  },
  productText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'left',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  expandText: {
    fontSize: 13,
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  noResultsText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 