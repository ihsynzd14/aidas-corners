import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, TextInput, Alert, ScrollView } from 'react-native';
import { PastryColors } from '@/constants/Colors';
import { CustomShareTemplate } from '@/services/customShareService';

// Predefined product categories
const PRODUCT_CATEGORIES = {
  'Cheesecakes': ['Cheesecake', 'Chocolate Cheesecake', 'Strawberry Cheesecake', 'Blueberry Cheesecake'],
  'Biscuits': ['Chocolate Cookie', 'Vanilla Biscuit', 'Almond Cookie', 'Oatmeal Cookie'],
  'Cakes': ['Birthday Cake', 'Chocolate Cake', 'Fruit Cake', 'Sponge Cake'],
  'Pastries': ['Croissant', 'Danish', 'Muffin', 'Bagel'],
  'Pies': ['Apple Pie', 'Cherry Pie', 'Pumpkin Pie', 'Lemon Meringue'],
  'Other': []
};

interface TemplateCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (template: Omit<CustomShareTemplate, 'id'>) => Promise<void>;
  availableProducts: string[];
  isDark: boolean;
  editingTemplate?: CustomShareTemplate;
}

export const TemplateCreationModal: React.FC<TemplateCreationModalProps> = ({
  visible,
  onClose,
  onSave,
  availableProducts,
  isDark,
  editingTemplate
}) => {
  const [templateName, setTemplateName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [templateText, setTemplateText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'individual'>('categories');

  // Initialize with editing template data
  useEffect(() => {
    if (editingTemplate) {
      setTemplateName(editingTemplate.name);
      setSelectedProducts(editingTemplate.products);
      setTemplateText(editingTemplate.template);
    } else {
      // Reset form
      setTemplateName('');
      setSelectedProducts([]);
      setTemplateText('');
      setSearchText('');
    }
  }, [editingTemplate, visible]);

  // Filter products based on search
  const filteredProducts = (availableProducts || []).filter(product =>
    product.toLowerCase().includes(searchText.toLowerCase()) &&
    !selectedProducts.includes(product)
  );

  // Add entire category to selected products
  const addCategoryProducts = (categoryProducts: string[]) => {
    const newProducts = categoryProducts.filter(product => 
      (availableProducts || []).includes(product) && 
      !selectedProducts.includes(product)
    );
    setSelectedProducts(prev => [...prev, ...newProducts]);
  };

  // Toggle individual product selection
  const toggleProduct = (product: string) => {
    setSelectedProducts(prev => 
      prev.includes(product) 
        ? prev.filter(p => p !== product)
        : [...prev, product]
    );
  };

  // Remove product from selection
  const removeProduct = (product: string) => {
    setSelectedProducts(prev => prev.filter(p => p !== product));
  };

  // Insert template variable at cursor position
  const insertVariable = (variable: string) => {
    const newText = templateText + variable;
    setTemplateText(newText);
  };

  // Save template
  const handleSave = async () => {
    if (!templateName.trim()) {
      Alert.alert('Xəta', 'Şablon adı daxil edin');
      return;
    }

    if (selectedProducts.length === 0) {
      Alert.alert('Xəta', 'Ən azı bir məhsul seçin');
      return;
    }

    if (!templateText.trim()) {
      Alert.alert('Xəta', 'Şablon mətnini daxil edin');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        name: templateName.trim(),
        products: selectedProducts,
        template: templateText.trim(),
        isActive: true
      });
      onClose();
    } catch (error) {
      Alert.alert('Xəta', 'Şablon saxlanarkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategoryItem = ({ item }: { item: [string, string[]] }) => {
    const [category, products] = item;
    const availableCategoryProducts = products.filter(product => 
      (availableProducts || []).includes(product)
    );
    const selectedCount = availableCategoryProducts.filter(product => 
      selectedProducts.includes(product)
    ).length;

    if (availableCategoryProducts.length === 0) return null;

    return (
      <TouchableOpacity
        onPress={() => addCategoryProducts(availableCategoryProducts)}
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.05)',
          padding: 16,
          borderRadius: 12,
          marginBottom: 8,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
          }}>
            {category}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{
              fontSize: 12,
              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)',
            }}>
              {selectedCount}/{availableCategoryProducts.length}
            </Text>
            <Text style={{ fontSize: 20, color: selectedCount === availableCategoryProducts.length ? '#25D366' : 
                   isDark ? PastryColors.vanilla : PastryColors.chocolate }}>
              {selectedCount === availableCategoryProducts.length ? '✓' : '+'}
            </Text>
          </View>
        </View>
        <Text style={{
          fontSize: 12,
          color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)',
          marginTop: 4,
        }}>
          {availableCategoryProducts.join(', ')}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProductItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => toggleProduct(item)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(74,53,49,0.02)',
        borderRadius: 8,
        marginBottom: 4,
      }}
    >
      <Text style={{ 
        fontSize: 20, 
        color: selectedProducts.includes(item) ? '#25D366' : 
               isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)' 
      }}>
        {selectedProducts.includes(item) ? '☑' : '☐'}
      </Text>
      <Text style={{
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
      }}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: isDark ? '#000000' : '#FFFFFF' }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
        }}>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ 
              fontSize: 24, 
              color: isDark ? PastryColors.vanilla : PastryColors.chocolate 
            }}>
              ✕
            </Text>
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
          }}>
            {editingTemplate ? 'Şablonu Redaktə Et' : 'Yeni Şablon Yarat'}
          </Text>
          
          <TouchableOpacity 
            onPress={handleSave}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.5 : 1 }}
          >
            <Text style={{ 
              fontSize: 24, 
              color: isLoading ? 'rgba(255,255,255,0.3)' : '#25D366' 
            }}>
              ✓
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          {/* Template Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
              marginBottom: 8,
            }}>
              Şablon Adı
            </Text>
            <TextInput
              value={templateName}
              onChangeText={setTemplateName}
              placeholder="Məs: Cheesecake Staff"
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(74,53,49,0.4)'}
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.05)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
              }}
            />
          </View>

          {/* Product Selection */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
              marginBottom: 12,
            }}>
              Məhsul Seçimi
            </Text>

            {/* Tab Selection */}
            <View style={{ 
              flexDirection: 'row', 
              marginBottom: 12,
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.05)',
              borderRadius: 8,
              padding: 4,
            }}>
              <TouchableOpacity
                onPress={() => setActiveTab('categories')}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 6,
                  backgroundColor: activeTab === 'categories' ? 
                    (isDark ? PastryColors.chocolate : '#FF9494') : 'transparent',
                }}
              >
                <Text style={{
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: '600',
                  color: activeTab === 'categories' ? 
                    (isDark ? PastryColors.vanilla : '#FFFFFF') : 
                    (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)'),
                }}>
                  Kateqoriyalar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setActiveTab('individual')}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 6,
                  backgroundColor: activeTab === 'individual' ? 
                    (isDark ? PastryColors.chocolate : '#FF9494') : 'transparent',
                }}
              >
                <Text style={{
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: '600',
                  color: activeTab === 'individual' ? 
                    (isDark ? PastryColors.vanilla : '#FFFFFF') : 
                    (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)'),
                }}>
                  Fərdi
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'categories' ? (
              <FlatList
                data={Object.entries(PRODUCT_CATEGORIES)}
                keyExtractor={item => item[0]}
                renderItem={renderCategoryItem}
                scrollEnabled={false}
              />
            ) : (
              <View>
                {/* Search Bar */}
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Məhsul axtar..."
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(74,53,49,0.4)'}
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.05)',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 14,
                    color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
                    marginBottom: 12,
                  }}
                />
                
                <FlatList
                  data={filteredProducts}
                  keyExtractor={item => item}
                  renderItem={renderProductItem}
                  scrollEnabled={false}
                  style={{ maxHeight: 200 }}
                />
              </View>
            )}

            {/* Selected Products */}
            {selectedProducts.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
                  marginBottom: 8,
                }}>
                  Seçilmiş Məhsullar ({selectedProducts.length})
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {selectedProducts.map(product => (
                    <TouchableOpacity
                      key={product}
                      onPress={() => removeProduct(product)}
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Text style={{
                        fontSize: 12,
                        color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
                      }}>
                        {product}
                      </Text>
                      <Text style={{ 
                        fontSize: 14, 
                        color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)' 
                      }}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  ))}
                 </View>
               </View>
             )}
           </View>

          {/* Template Text */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
              marginBottom: 8,
            }}>
              Şablon Mətni
            </Text>
            
            {/* Template Variables */}
            <View style={{ marginBottom: 8 }}>
              <Text style={{
                fontSize: 12,
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)',
                marginBottom: 4,
              }}>
                Dəyişənlər:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {['$choosen_cheesecake_products', '$choosen_biscuit_products', '$total_quantity'].map(variable => (
                  <TouchableOpacity
                    key={variable}
                    onPress={() => insertVariable(variable)}
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{
                      fontSize: 11,
                      color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
                    }}>
                      {variable}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              value={templateText}
              onChangeText={setTemplateText}
              placeholder="Şablon mətnini buraya yazın..."
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(74,53,49,0.4)'}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.05)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)',
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
                textAlignVertical: 'top',
                minHeight: 100,
              }}
            />
          </View>

          {/* Preview */}
          {templateText && selectedProducts.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
                marginBottom: 8,
              }}>
                Ön Baxış
              </Text>
              <View style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.05)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)',
                borderRadius: 8,
                padding: 12,
              }}>
                <Text style={{
                  fontSize: 12,
                  color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(74,53,49,0.8)',
                  lineHeight: 18,
                }}>
                  {templateText
                    .replace('$choosen_cheesecake_products', selectedProducts.map(p => `${p}: 10`).join('\n'))
                    .replace('$choosen_biscuit_products', selectedProducts.map(p => `${p}: 10`).join('\n'))
                    .replace('$total_quantity', selectedProducts.length * 10 + '')}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};