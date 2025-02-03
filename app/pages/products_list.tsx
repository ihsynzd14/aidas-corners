import { StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, useColorScheme } from 'react-native';
import { TopBar } from '../../components/TopBar';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { PRODUCT_CORRECTIONS } from '../../utils/orderCorrection';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';

export default function ProductsListScreen() {
  const colorScheme = useColorScheme();
  const [expandedProducts, setExpandedProducts] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return PRODUCT_CORRECTIONS;
    
    const query = searchQuery.toLowerCase().trim();
    return PRODUCT_CORRECTIONS.filter(product => 
      product.correct.toLowerCase().includes(query) ||
      product.variations.some(v => v.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const toggleExpand = (index: number) => {
    setExpandedProducts(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={[styles.container, colorScheme === 'dark' && styles.darkContainer]}>
        <TopBar 
          title="Məhsul Listi" 
          style={styles.topBar}
        />
        
        <ThemedView style={[styles.searchContainer, colorScheme === 'dark' && styles.darkSearchContainer]}>
          <AntDesign 
            name="search1" 
            size={20} 
            color={colorScheme === 'dark' ? '#999' : '#666'}
            style={styles.searchIcon}
          />
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
              <AntDesign name="close" size={20} color={colorScheme === 'dark' ? '#999' : '#666'} />
            </TouchableOpacity>
          )}
        </ThemedView>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredProducts.map((product, index) => (
            <ThemedView
              key={index}
              style={[styles.card, colorScheme === 'dark' && styles.darkCard]}
            >
              <ThemedView style={[styles.cardInner]}>
                <ThemedView style={styles.cardHeader}>
                  <MaterialCommunityIcons 
                    name="cookie" 
                    size={24} 
                    color={colorScheme === 'dark' ? '#E0C1BC' : '#4A3531'}
                    style={styles.cardIcon}
                  />
                  <ThemedText style={[styles.productName, colorScheme === 'dark' && styles.darkProductName]}>
                    {product.correct}
                  </ThemedText>
                </ThemedView>

                <TouchableOpacity 
                  style={[styles.sectionHeaderContainer, colorScheme === 'dark' && styles.darkSectionHeaderContainer]}
                  onPress={() => toggleExpand(index)}
                  activeOpacity={0.7}
                >
                  <ThemedView style={styles.sectionHeader}>
                    <AntDesign 
                      name="warning" 
                      size={16} 
                      color={colorScheme === 'dark' ? '#E0C1BC' : '#666'}
                      style={styles.sectionIcon}
                    />
                    <ThemedText style={[styles.sectionTitle, colorScheme === 'dark' && styles.darkSectionTitle]}>
                      Düzəldilə bilinən Yanlış Yazımlar ({product.variations.length})
                    </ThemedText>
                    <ThemedView style={[styles.expandIconContainer, colorScheme === 'dark' && styles.darkExpandIconContainer]}>
                      <AntDesign 
                        name={expandedProducts.includes(index) ? "up" : "down"} 
                        size={16} 
                        color={colorScheme === 'dark' ? '#E0C1BC' : '#666'}
                      />
                    </ThemedView>
                  </ThemedView>
                </TouchableOpacity>

                {expandedProducts.includes(index) && (
                  <ThemedView style={styles.variationsContainer}>
                    {product.variations.map((variation, vIndex) => (
                      <ThemedView
                        key={vIndex}
                        style={[styles.variationChip, colorScheme === 'dark' && styles.darkVariationChip]}
                      >
                        <AntDesign 
                          name="right" 
                          size={12} 
                          color={colorScheme === 'dark' ? '#E0C1BC' : '#4A3531'}
                          style={styles.variationIcon}
                        />
                        <ThemedText style={[styles.variationText, colorScheme === 'dark' && styles.darkVariationText]}>
                          {variation}
                        </ThemedText>
                      </ThemedView>
                    ))}
                  </ThemedView>
                )}
              </ThemedView>
            </ThemedView>
          ))}
        </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: 'rgba(74, 53, 49, 0.05)',
    borderRadius: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4A3531',
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // TabLayout için extra padding
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardInner: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    marginRight: 12,
  },
  productName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A3531',
    flex: 1,
  },
  sectionHeaderContainer: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 53, 49, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  sectionIcon: {
    marginRight: 8,
  },
  expandIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 53, 49, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  variationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  variationChip: {
    backgroundColor: 'rgba(74, 53, 49, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  variationIcon: {
    marginRight: 6,
  },
  variationText: {
    fontSize: 13,
    color: '#4A3531',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkSearchContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
  },
  darkSearchInput: {
    color: '#fff',
  },
  darkCard: {
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 8,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },

  darkProductName: {
    color: '#fff',
  },
  darkSectionHeaderContainer: {
    backgroundColor: '#2C2C2C',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  darkSectionTitle: {
    color: 'rgba(255, 255, 255, 0.87)',
  },
  darkExpandIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  darkVariationChip: {
    backgroundColor: '#2C2C2C',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  darkVariationText: {
    color: 'rgba(255, 255, 255, 0.87)',
  },
}); 