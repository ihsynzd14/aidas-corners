import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AntDesign } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';

interface ProductStats {
  productName: string;
  totalQuantity: number;
  branchStats: {
    [key: string]: {
      quantity: number;
      dates: { [date: string]: number };
    };
  };
}

interface ProductSelectionBottomSheetProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  selectedProduct: string;
  selectedBranch: string;
  productStats: ProductStats[];
  availableBranches: string[];
  setSelectedProduct: (product: string) => void;
  setSelectedBranch: (branch: string) => void;
  setAvailableBranches: (branches: string[]) => void;
}

export const ProductSelectionBottomSheet: React.FC<ProductSelectionBottomSheetProps> = ({
  bottomSheetModalRef,
  selectedProduct,
  selectedBranch,
  productStats,
  availableBranches,
  setSelectedProduct,
  setSelectedBranch,
  setAvailableBranches,
}) => {
  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={['75%']}
      onChange={(index) => {
        if (index === -1) {
          // Handle sheet close
        }
      }}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.bottomSheetIndicator}
    >
      <ThemedView style={styles.bottomSheetContent}>
        <ThemedText style={styles.bottomSheetMainTitle}>
          {selectedProduct ? 'Filial Seçin' : 'Məhsul Seçin'}
        </ThemedText>
        
        {!selectedProduct ? (
          <BottomSheetScrollView contentContainerStyle={styles.bottomSheetScrollViewContent}>
            {productStats.map((stat, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.bottomSheetItem,
                  selectedProduct === stat.productName && styles.selectedItem
                ]}
                onPress={() => {
                  setSelectedProduct(stat.productName);
                  setAvailableBranches(Object.keys(stat.branchStats));
                }}
              >
                <ThemedView style={styles.bottomSheetItemContent}>
                  <ThemedText style={[
                    styles.bottomSheetItemText,
                    selectedProduct === stat.productName && styles.selectedItemText
                  ]}>
                    {stat.productName}
                  </ThemedText>
                  <ThemedText style={[
                    styles.bottomSheetItemSubtext,
                    selectedProduct === stat.productName && styles.selectedItemText
                  ]}>
                    Ümumi: {stat.totalQuantity} ədəd
                  </ThemedText>
                </ThemedView>
                <AntDesign 
                  name="right" 
                  size={20} 
                  color={selectedProduct === stat.productName ? '#fff' : '#4A3531'} 
                />
              </TouchableOpacity>
            ))}
          </BottomSheetScrollView>
        ) : (
          <ThemedView style={styles.branchSelectionContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setSelectedProduct('')}
            >
              <AntDesign name="left" size={20} color="#4A3531" />
              <ThemedText style={styles.backButtonText}>Geri</ThemedText>
            </TouchableOpacity>

            <BottomSheetScrollView contentContainerStyle={styles.bottomSheetScrollViewContent}>
              {availableBranches.map((branch, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.bottomSheetItem,
                    selectedBranch === branch && styles.selectedItem
                  ]}
                  onPress={() => {
                    setSelectedBranch(branch);
                    bottomSheetModalRef.current?.dismiss();
                  }}
                >
                  <ThemedText style={[
                    styles.bottomSheetItemText,
                    selectedBranch === branch && styles.selectedItemText
                  ]}>
                    {branch}
                  </ThemedText>
                  <AntDesign 
                    name="check" 
                    size={20} 
                    color={selectedBranch === branch ? '#fff' : 'transparent'} 
                  />
                </TouchableOpacity>
              ))}
            </BottomSheetScrollView>
          </ThemedView>
        )}
      </ThemedView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSheetIndicator: {
    backgroundColor: '#4A3531',
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 24,
  },
  bottomSheetMainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A3531',
    marginBottom: 24,
    textAlign: 'center',
  },
  bottomSheetScrollViewContent: {
    paddingBottom: 24,
  },
  bottomSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(74, 53, 49, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(74, 53, 49, 0.1)',
  },
  bottomSheetItemContent: {
    flex: 1,
  },
  selectedItem: {
    backgroundColor: '#4A3531',
    borderColor: '#4A3531',
  },
  bottomSheetItemText: {
    fontSize: 18,
    color: '#4A3531',
    marginBottom: 4,
  },
  bottomSheetItemSubtext: {
    fontSize: 14,
    color: '#666',
  },
  selectedItemText: {
    color: '#fff',
  },
  branchSelectionContainer: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A3531',
    marginLeft: 8,
  },
}); 