import { StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, useColorScheme, Alert, Animated, Dimensions } from 'react-native';
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect } from 'react';
import { TopBar } from '../../components/TopBar';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { getProductCorrections, refreshProductCorrections } from '../../utils/orderCorrection';
import { updateProductCorrection, ProductDefinition } from '../../utils/firebase';
import { AntDesign, MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useState, useMemo, useRef } from 'react';
import { colorScheme as appColorScheme } from '@/constants/colorScheme';
import { EditProductSheet } from '../components/EditProductSheet';

import { useRouter } from 'expo-router';

export default function ProductsListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<ProductDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Sheet State
  const [selectedProduct, setSelectedProduct] = useState<ProductDefinition | null>(null);
  const [editSheetVisible, setEditSheetVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
      const corrections = await getProductCorrections();
      setProducts(corrections);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshProductCorrections();
      const corrections = await getProductCorrections();
      setProducts(corrections);
    } catch (error) {
      console.error('Error refreshing products:', error);
      Alert.alert('Xəta', 'Məhsullar yenilənərkən xəta baş verdi');
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditProduct = (product: ProductDefinition) => {
    setSelectedProduct(product);
    setEditSheetVisible(true);
  };

  const handleSaveProduct = async (updatedProduct: ProductDefinition) => {
    try {
      if (!updatedProduct.id) {
        throw new Error('Product ID is missing');
      }

      // Optimistic update
      setProducts(prev =>
        prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
      );

      const updateData: any = {
        correct: updatedProduct.correct,
        variations: updatedProduct.variations,
      };

      // Explicitly handle units field
      if (updatedProduct.units) {
        updateData.units = updatedProduct.units;
      } else {
        // Explicitly set units to null to remove it
        updateData.units = null;
      }

      await updateProductCorrection(updatedProduct.id!, updateData);

      // Refresh to ensure sync
      // await handleRefresh(); 
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Xəta', 'Məhsul yenilənərkən xəta baş verdi');
      // Revert optimistic update if needed (could be improved)
      loadProducts();
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase().trim();
    return products.filter(product =>
      product.correct.toLowerCase().includes(query) ||
      product.variations.some((v: string) => v.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);



  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={[styles.container, colorScheme === 'dark' && styles.darkContainer]}>
        <TopBar
          title="Məhsul Listi"
          style={styles.topBar}
          leftComponent={{
            icon: 'back',
            onPress: () => router.back()
          }}
          rightComponent={
            <TouchableOpacity
              style={[
                styles.refreshButton,
                { opacity: refreshing ? 0.5 : 1 }
              ]}
              onPress={handleRefresh}
              disabled={refreshing}
              activeOpacity={0.7}
            >
              <Ionicons
                name="refresh"
                size={20}
                color={colorScheme === 'dark' ? '#E0C1BC' : '#4A3531'}
              />
            </TouchableOpacity>
          }
        />

        <Animated.View style={[styles.searchWrapper, { opacity: fadeAnim }]}>
          <ThemedView style={[styles.searchContainer, colorScheme === 'dark' && styles.darkSearchContainer]}>
            <Feather name="search" size={20} color={colorScheme === 'dark' ? '#999' : '#666'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, colorScheme === 'dark' && styles.darkSearchInput]}
              placeholder="Məhsul Axtar..."
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <AntDesign name="close-circle" size={18} color={colorScheme === 'dark' ? '#999' : '#666'} />
              </TouchableOpacity>
            )}
          </ThemedView>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustContentInsets={false}
        >
          {loading ? (
            <ThemedView style={styles.loadingContainer}>
              <MaterialCommunityIcons name="cookie-outline" size={48} color={colorScheme === 'dark' ? '#E0C1BC' : '#4A3531'} />
              <ThemedText style={styles.loadingText}>Məhsullar yüklənir...</ThemedText>
            </ThemedView>
          ) : filteredProducts.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <Feather name="search" size={48} color={colorScheme === 'dark' ? '#666' : '#999'} />
              <ThemedText style={styles.emptyText}>Məhsul tapılmadı</ThemedText>
            </ThemedView>
          ) : (
            filteredProducts.map((product, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.cardWrapper,
                  {
                    opacity: fadeAnim,
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      })
                    }]
                  }
                ]}
              >
                <ThemedView style={[styles.card, colorScheme === 'dark' && styles.darkCard]}>
                  <ThemedView style={styles.cardInner}>
                    <ThemedView style={styles.cardHeader}>
                      <ThemedView style={styles.iconContainer}>
                        <MaterialCommunityIcons
                          name="cookie"
                          size={28}
                          color={colorScheme === 'dark' ? '#E0C1BC' : '#4A3531'}
                        />
                      </ThemedView>
                      <ThemedView style={styles.productInfo}>
                        <ThemedText style={[styles.productName, colorScheme === 'dark' && styles.darkProductName]}>
                          {product.correct}
                        </ThemedText>
                        <ThemedText style={[styles.variationCount, colorScheme === 'dark' && styles.darkVariationCount]}>
                          {product.variations.length} variant
                          {product.units && product.units.type && (
                            <ThemedText style={[styles.unitInfo, colorScheme === 'dark' && styles.darkUnitInfo]}>
                              {' • '}{product.units.type === 'weight' ? 'Çəki' : product.units.type === 'box' ? 'Qutu' : 'Ədəd'}
                              {product.units.variations && product.units.variations.length > 0 && ` (${product.units.variations.length})`}
                            </ThemedText>
                          )}
                        </ThemedText>
                      </ThemedView>
                      <TouchableOpacity
                        style={[styles.editButton, colorScheme === 'dark' && styles.darkEditButton]}
                        onPress={() => handleEditProduct(product)}
                      >
                        <AntDesign
                          name="edit"
                          size={16}
                          color={colorScheme === 'dark' ? '#E0C1BC' : '#4A3531'}
                        />
                      </TouchableOpacity>
                    </ThemedView>

                    <ThemedView style={styles.variationsSection}>
                      <ThemedView style={styles.variationsHeader}>
                        <AntDesign
                          name="exclamation-circle"
                          size={16}
                          color={colorScheme === 'dark' ? '#E0C1BC' : '#FF6B6B'}
                          style={styles.variationsIcon}
                        />
                        <ThemedText style={[styles.variationsTitle, colorScheme === 'dark' && styles.darkVariationsTitle]}>
                          Yanlış Yazımlar ({product.variations.length})
                        </ThemedText>
                      </ThemedView>
                      <ThemedView style={styles.variationsContainer}>
                        {product.variations.map((variation: string, vIndex: number) => (
                          <ThemedView
                            key={vIndex}
                            style={[styles.variationChip, colorScheme === 'dark' && styles.darkVariationChip]}
                          >
                            <ThemedView style={styles.variationDot} />
                            <ThemedText style={[styles.variationText, colorScheme === 'dark' && styles.darkVariationText]}>
                              {variation}
                            </ThemedText>
                          </ThemedView>
                        ))}
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>
                </ThemedView>
              </Animated.View>
            ))
          )}
        </ScrollView>

        {selectedProduct && (
          <EditProductSheet
            visible={editSheetVisible}
            onClose={() => {
              setEditSheetVisible(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct}
            onSave={handleSaveProduct}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
    backgroundColor: appColorScheme.backgroundLight,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: appColorScheme.borderRed,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: appColorScheme.textLight,
    height: '100%',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    backgroundColor: appColorScheme.cardLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: appColorScheme.borderRed,
  },
  cardInner: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: appColorScheme.lightRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: appColorScheme.textLight,
    marginBottom: 4,
  },
  variationCount: {
    fontSize: 14,
    color: appColorScheme.textSubtleLight,
    fontWeight: '500',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: appColorScheme.lightRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  variationsSection: {
    marginTop: 16,
  },
  variationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  variationsIcon: {
    marginRight: 8,
  },
  variationsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: appColorScheme.textSubtleLight,
  },
  variationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  variationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 53, 49, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(74, 53, 49, 0.1)',
  },
  variationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4A3531',
    marginRight: 8,
  },
  variationText: {
    fontSize: 14,
    color: '#4A3531',
    fontWeight: '500',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkSearchContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  darkSearchInput: {
    color: '#fff',
  },
  darkCard: {
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 10,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  darkProductName: {
    color: '#fff',
  },
  darkVariationCount: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  unitInfo: {
    fontSize: 12,
    color: '#888',
    fontWeight: '400',
  },
  darkUnitInfo: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  darkEditButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  darkExpandSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  darkVariationsTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  darkVariationChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  darkVariationText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(74, 53, 49, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});