import React, { useState } from 'react';
import { TouchableOpacity, View, Alert, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
import { Colors, PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { deleteBranchOrders, deleteProduct, updateProduct, addProductToBranch } from '@/utils/firebase';
import { EditModal } from './EditModal';

interface BranchSectionProps {
  branchName: string;
  products: Record<string, number>;
  selectedDate: Date;
  onDataChange: () => void;
}

export function BranchSection({ 
  branchName, 
  products, 
  selectedDate,
  onDataChange 
}: BranchSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{ name: string; quantity: string } | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const isDark = useColorScheme() === 'dark';

  const handleDeleteBranch = () => {
    Alert.alert(
      'Təsdiq',
      'Bu filialın bütün məlumatlarını silmək istədiyinizə əminsiniz?',
      [
        { text: 'İmtina', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBranchOrders(selectedDate, branchName);
              onDataChange();
            } catch (error) {
              Alert.alert('Xəta', 'Məlumatları silmək mümkün olmadı');
            }
          }
        }
      ]
    );
  };

  const handleDeleteProduct = (productName: string) => {
    Alert.alert(
      'Təsdiq',
      'Bu məhsulu silmək istədiyinizə əminsiniz?',
      [
        { text: 'İmtina', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(selectedDate, branchName, productName);
              onDataChange();
            } catch (error) {
              Alert.alert('Xəta', 'Məhsulu silmək mümkün olmadı');
            }
          }
        }
      ]
    );
  };

  const handleEditProduct = (productName: string, quantity: string) => {
    setEditingProduct({ name: productName, quantity: quantity.toString() });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async (newProductName: string, newQuantity: string) => {
    if (!editingProduct) return;
    
    try {
      await updateProduct(
        selectedDate,
        branchName,
        editingProduct.name,
        newProductName,
        newQuantity
      );
      onDataChange();
    } catch (error) {
      Alert.alert('Xəta', 'Məhsulu yeniləmək mümkün olmadı');
    }
  };

  const handleAddProduct = async (productName: string, quantity: string) => {
    try {
      await addProductToBranch(selectedDate, branchName, productName, quantity);
      onDataChange();
    } catch (error) {
      Alert.alert('Xəta', 'Məhsul əlavə etmək mümkün olmadı');
    }
  };

    return (
      <ThemedView style={{
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: isDark ? PastryColors.chocolate : PastryColors.vanilla,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3
      }}>
        <TouchableOpacity 
          onPress={() => setIsExpanded(!isExpanded)}
          style={{
            padding: 16,
            borderBottomWidth: isExpanded ? 1 : 0,
            borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'
          }}
        >
          <ThemedView style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'transparent'
          }}>
            {/* Branch Info Section */}
            <ThemedView style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'transparent',
                flex: 1,
                marginRight: 16,
                maxWidth: '70%' // Limit the width to prevent overflow
                }}>
                <ThemedView style={{
                    height: 44,
                    width: 44,
                    borderRadius: 22,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.05)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                    flexShrink: 0 // Prevent icon from shrinking
                }}>
                <MaterialCommunityIcons 
                    name="store" 
                    size={24}
                    color={isDark ? PastryColors.vanilla : PastryColors.chocolate} 
                    />
                </ThemedView>
              
                <ThemedView style={{ 
                    backgroundColor: 'transparent',
                    flex: 1 // Allow text container to take remaining space
                }}>
                    <ThemedText 
                    numberOfLines={2} // Add text truncation
                    ellipsizeMode="tail"
                    style={{
                        fontSize: 17,
                        fontWeight: '600',
                        color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
                        marginBottom: 4
                    }}>
                    {branchName}
                    </ThemedText>
                    <ThemedText 
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                            fontSize: 14,
                            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'
                        }}>
                        {Object.keys(products).length} məhsul
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            {/* Action Buttons */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                flexShrink: 0 // Prevent buttons from shrinking
                }}>
              <TouchableOpacity
                onPress={() => setAddModalVisible(true)}
                style={{
                  padding: 10,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.05)',
                  borderRadius: 10
                }}
              >
                <AntDesign 
                  name="plus" 
                  size={20}
                  color={isDark ? PastryColors.vanilla : PastryColors.chocolate} 
                />
              </TouchableOpacity>
  
              <TouchableOpacity
                onPress={handleDeleteBranch}
                style={{
                  padding: 10,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.05)',
                  borderRadius: 10
                }}
              >
                <AntDesign 
                  name="delete" 
                  size={20}
                  color={Colors.danger} 
                />
              </TouchableOpacity>
  
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.05)',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Feather 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={20}
                  color={isDark ? PastryColors.vanilla : PastryColors.chocolate} 
                />
              </View>
            </View>
          </ThemedView>
        </TouchableOpacity>
  
        {isExpanded && (
          <ThemedView style={{
            backgroundColor: 'transparent',
            padding: 16
          }}>
            {Object.entries(products).map(([product, quantity], index) => (
              <ThemedView 
                key={product} 
                style={{
                  marginBottom: index === Object.keys(products).length - 1 ? 0 : 12,
                  backgroundColor: 'transparent'
                }}
              >
                <ThemedView style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.03)',
                  padding: 14,
                  borderRadius: 12
                }}>
                  {/* Product Name Section */}
                  <ThemedView style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                    marginRight: 16,
                    backgroundColor: 'transparent'
                  }}>
                    <MaterialCommunityIcons 
                      name="cookie" 
                      size={20} 
                      color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)'} 
                      style={{ marginRight: 12 }}
                    />
                    <ThemedText style={{
                      flex: 1,
                      fontSize: 16,
                      color: isDark ? PastryColors.vanilla : '#333',
                      fontWeight: '500'
                    }}>
                      {product}
                    </ThemedText>
                  </ThemedView>
  
                  {/* Product Actions */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <ThemedView style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(74,53,49,0.07)',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      minWidth: 45,
                      alignItems: 'center'
                    }}>
                      <ThemedText style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: isDark ? PastryColors.vanilla : PastryColors.chocolate
                      }}>
                        {quantity}
                      </ThemedText>
                    </ThemedView>
  
                    <TouchableOpacity
                      onPress={() => handleEditProduct(product, quantity.toString())}
                      style={{
                        padding: 8,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.05)',
                        borderRadius: 8
                      }}
                    >
                      <AntDesign 
                        name="edit" 
                        size={18}
                        color={isDark ? PastryColors.vanilla : PastryColors.chocolate} 
                      />
                    </TouchableOpacity>
  
                    <TouchableOpacity
                      onPress={() => handleDeleteProduct(product)}
                      style={{
                        padding: 8,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.05)',
                        borderRadius: 8
                      }}
                    >
                      <AntDesign 
                        name="delete" 
                        size={18}
                        color={Colors.danger} 
                      />
                    </TouchableOpacity>
                  </View>
                </ThemedView>
              </ThemedView>
            ))}
          </ThemedView>
        )}
  
        <EditModal
          visible={editModalVisible}
          onClose={() => {
            setEditModalVisible(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveEdit}
          initialProduct={editingProduct?.name}
          initialQuantity={editingProduct?.quantity}
        />
  
        <EditModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onSave={handleAddProduct}
          isNewProduct={true}
        />
      </ThemedView>
    );
  }