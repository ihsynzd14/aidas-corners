import { ScrollView, SafeAreaView, TouchableOpacity, TextInput, useColorScheme, Alert, Animated, Dimensions, View } from 'react-native';
import { useEffect } from 'react';
import { TopBar } from '../../components/TopBar';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { getProductCorrections, refreshProductCorrections } from '../../utils/orderCorrection';
import { updateProductCorrection, addProductCorrection, deleteProductCorrection, ProductDefinition } from '../../utils/firebase';
import { AntDesign, MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useState, useMemo, useRef } from 'react';
import { EditProductSheet } from '../components/EditProductSheet';
import { AddProductSheet } from '../components/AddProductSheet';
import { productsListStyles as styles } from '../../components/ui/styles/productsList.styles';
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

  // Add Product Sheet State
  const [addSheetVisible, setAddSheetVisible] = useState(false);

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

      // Include price if provided
      if (updatedProduct.price !== undefined) {
        updateData.price = updatedProduct.price;
      }

      // Include priceHistory if provided
      if (updatedProduct.priceHistory) {
        updateData.priceHistory = updatedProduct.priceHistory;
      }

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

  const handleDeleteProduct = async (product: ProductDefinition) => {
    if (!product.id) return;

    Alert.alert(
      'Məhsulu Sil',
      `"${product.correct}" məhsulunu silmək istədiyinizə əminsiniz?`,
      [
        {
          text: 'Ləğv et',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              // Optimistic update - remove from list
              setProducts(prev => prev.filter(p => p.id !== product.id));

              await deleteProductCorrection(product.id!);
              Alert.alert('Uğur', 'Məhsul uğurla silindi');
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Xəta', 'Məhsul silinərkən xəta baş verdi');
              loadProducts();
            }
          },
        },
      ]
    );
  };

  const handleAddProduct = async (newProduct: Omit<ProductDefinition, 'id'>) => {
    try {
      const docId = await addProductCorrection(newProduct);
      Alert.alert('Uğur', 'Yeni məhsul uğurla əlavə edildi');
      loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Xəta', 'Məhsul əlavə edilərkən xəta baş verdi');
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
            <View style={styles.topBarActions}>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { opacity: refreshing ? 0.5 : 1 }
                ]}
                onPress={() => setAddSheetVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="add"
                  size={22}
                  color={colorScheme === 'dark' ? '#4CAF50' : '#4CAF50'}
                />
              </TouchableOpacity>
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
            </View>
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
                  {/* Card Gradient Accent */}
                  <ThemedView style={[styles.cardAccent, colorScheme === 'dark' && styles.darkCardAccent]} />

                  <ThemedView style={styles.cardInner}>
                    {/* Main Product Section */}
                    <ThemedView style={styles.mainSection}>
                      {/* Product Icon with Badge */}
                      <ThemedView style={styles.iconWrapper}>
                        <ThemedView style={[styles.iconBadge, colorScheme === 'dark' && styles.darkIconBadge]}>
                          <MaterialCommunityIcons
                            name="cookie"
                            size={24}
                            color={colorScheme === 'dark' ? '#E0C1BC' : '#4A3531'}
                          />
                        </ThemedView>
                        {product.variations.length > 0 && (
                          <ThemedView style={[styles.variantBadge, colorScheme === 'dark' && styles.darkVariantBadge]}>
                            <ThemedText style={styles.variantBadgeText}>{product.variations.length}</ThemedText>
                          </ThemedView>
                        )}
                      </ThemedView>

                      {/* Product Info */}
                      <ThemedView style={styles.productInfo}>
                        <ThemedText style={[styles.productName, colorScheme === 'dark' && styles.darkProductName]}>
                          {product.correct}
                        </ThemedText>

                        {/* Meta Info Row */}
                        <ThemedView style={styles.metaInfoRow}>
                          {product.price && (
                            <ThemedView style={[styles.priceTag, colorScheme === 'dark' && styles.darkPriceTag]}>
                              <Ionicons name="pricetag" size={12} color="#4CAF50" style={styles.priceTagIcon} />
                              <ThemedText style={[styles.priceText, colorScheme === 'dark' && styles.darkPriceText]}>
                                {product.price.toFixed(2)} AZN
                              </ThemedText>
                            </ThemedView>
                          )}
                          {product.units && product.units.type && (
                            <ThemedView style={[styles.unitTag, colorScheme === 'dark' && styles.darkUnitTag]}>
                              <Ionicons
                                name={product.units.type === 'weight' ? 'scale' : product.units.type === 'box' ? 'cube' : 'apps'}
                                size={12}
                                color={colorScheme === 'dark' ? '#E0C1BC' : '#4A3531'}
                                style={styles.unitTagIcon}
                              />
                              <ThemedText style={[styles.unitText, colorScheme === 'dark' && styles.darkUnitText]}>
                                {product.units.type === 'weight' ? 'Çəki' : product.units.type === 'box' ? 'Qutu' : 'Ədəd'}
                              </ThemedText>
                              {product.units.variations && product.units.variations.length > 0 && (
                                <ThemedText style={[styles.unitCount, colorScheme === 'dark' && styles.darkUnitCount]}>
                                  ({product.units.variations.length})
                                </ThemedText>
                              )}
                            </ThemedView>
                          )}
                        </ThemedView>
                      </ThemedView>

                      {/* Action Buttons */}
                      <ThemedView style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.editButton, colorScheme === 'dark' && styles.darkEditButton]}
                          onPress={() => handleEditProduct(product)}
                          activeOpacity={0.7}
                        >
                          <AntDesign
                            name="edit"
                            size={18}
                            color={colorScheme === 'dark' ? '#E0C1BC' : '#4A3531'}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton, colorScheme === 'dark' && styles.darkDeleteButton]}
                          onPress={() => handleDeleteProduct(product)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color={colorScheme === 'dark' ? '#FF6B6B' : '#FF4444'}
                          />
                        </TouchableOpacity>
                      </ThemedView>
                    </ThemedView>

                    {/* Variations Section */}
                    {product.variations.length > 0 && (
                      <ThemedView style={[styles.variationsSection, colorScheme === 'dark' && styles.darkVariationsSection]}>
                        <ThemedView style={styles.variationsHeader}>
                          <ThemedView style={[styles.variationsIconWrapper, colorScheme === 'dark' && styles.darkVariationsIconWrapper]}>
                            <AntDesign
                              name="exclamation-circle"
                              size={14}
                              color={colorScheme === 'dark' ? '#E0C1BC' : '#FF6B6B'}
                            />
                          </ThemedView>
                          <ThemedText style={[styles.variationsTitle, colorScheme === 'dark' && styles.darkVariationsTitle]}>
                            Yanlış Yazımlar
                          </ThemedText>
                          <ThemedView style={[styles.variationsCountBadge, colorScheme === 'dark' && styles.darkVariationsCountBadge]}>
                            <ThemedText style={styles.variationsCountText}>{product.variations.length}</ThemedText>
                          </ThemedView>
                        </ThemedView>
                        <ThemedView style={styles.variationsContainer}>
                          {product.variations.map((variation: string, vIndex: number) => (
                            <ThemedView
                              key={vIndex}
                              style={[styles.variationChip, colorScheme === 'dark' && styles.darkVariationChip]}
                            >
                              <ThemedView style={[styles.variationDot, colorScheme === 'dark' && styles.darkVariationDot]} />
                              <ThemedText style={[styles.variationText, colorScheme === 'dark' && styles.darkVariationText]}>
                                {variation}
                              </ThemedText>
                            </ThemedView>
                          ))}
                        </ThemedView>
                      </ThemedView>
                    )}
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

        <AddProductSheet
          visible={addSheetVisible}
          onClose={() => setAddSheetVisible(false)}
          onSave={handleAddProduct}
        />
      </ThemedView>
    </SafeAreaView>
  );
}
