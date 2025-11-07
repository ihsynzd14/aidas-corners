import React, { useState } from 'react';
import { Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { EmptyOrdersTableState } from './EmptyOrderState';
import { ModernBranchSection } from './ModernBranchSection';
import { EditModal } from './EditModal';
import { deleteBranchOrders, deleteProduct, updateProduct, addProductToBranch } from '@/utils/firebase';

interface ModernOrdersSummaryTableProps {
  ordersData: Record<string, Record<string, number>>;
  selectedDate: Date;
  onDataChange: () => void;
}

export function ModernOrdersSummaryTable({ 
  ordersData, 
  selectedDate, 
  onDataChange 
}: ModernOrdersSummaryTableProps) {
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<{ name: string; quantity: string } | null>(null);

  if (!ordersData || Object.keys(ordersData).length === 0) {
    return (
      <ThemedView style={{ padding: 16, alignItems: 'center' }}>
        <EmptyOrdersTableState />
      </ThemedView>
    );
  }

  const toggleBranchExpansion = (branchName: string) => {
    setExpandedBranches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(branchName)) {
        newSet.delete(branchName);
      } else {
        newSet.add(branchName);
      }
      return newSet;
    });
  };

  const handleDeleteBranch = (branchName: string) => {
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

  const handleAddProduct = (branchName: string) => {
    setCurrentBranch(branchName);
    setAddModalVisible(true);
  };

  const handleEditProduct = (branchName: string, productName: string, quantity: string) => {
    setCurrentBranch(branchName);
    setEditingProduct({ name: productName, quantity });
    setEditModalVisible(true);
  };

  const handleDeleteProduct = (branchName: string, productName: string) => {
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

  const handleSaveEdit = async (newProductName: string, newQuantity: string) => {
    if (!editingProduct) return;
    
    try {
      await updateProduct(
        selectedDate,
        currentBranch,
        editingProduct.name,
        newProductName,
        newQuantity
      );
      onDataChange();
    } catch (error) {
      Alert.alert('Xəta', 'Məhsulu yeniləmək mümkün olmadı');
    }
  };

  const handleAddNewProduct = async (productName: string, quantity: string) => {
    try {
      await addProductToBranch(selectedDate, currentBranch, productName, quantity);
      onDataChange();
    } catch (error) {
      Alert.alert('Xəta', 'Məhsul əlavə etmək mümkün olmadı');
    }
  };

  return (
    <ThemedView style={{ paddingHorizontal: 8 }}>
      {Object.entries(ordersData).map(([branchName, products]) => (
        <ModernBranchSection
          key={branchName}
          branchName={branchName}
          products={products}
          isExpanded={expandedBranches.has(branchName)}
          onToggleExpand={() => toggleBranchExpansion(branchName)}
          onDeleteBranch={() => handleDeleteBranch(branchName)}
          onAddProduct={() => handleAddProduct(branchName)}
          onEditProduct={(productName, quantity) => 
            handleEditProduct(branchName, productName, quantity)
          }
          onDeleteProduct={(productName) => 
            handleDeleteProduct(branchName, productName)
          }
        />
      ))}

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
        onSave={handleAddNewProduct}
        isNewProduct={true}
      />
    </ThemedView>
  );
}
