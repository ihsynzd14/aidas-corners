import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, useColorScheme } from 'react-native';
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Ana renkler
  const bgColor = isDark ? '#111827' : '#f9e3bf';
  const contentBgColor = isDark ? '#1F2937' : '#fae6c5';
  const textColor = isDark ? '#F3F4F6' : '#111827';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#fadeb3';
  const itemBgColor = isDark ? '#374151' : '#feebd6';
  const selectedBgColor = isDark ? '#4B5563' : '#4A3531';

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
      backgroundStyle={[styles.bottomSheetBackground, { backgroundColor: bgColor }]}
      handleIndicatorStyle={[styles.bottomSheetIndicator, { backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }]}
    >
      <View style={[styles.bottomSheetContent, { backgroundColor: contentBgColor }]}>
        <Text style={[styles.bottomSheetMainTitle, { color: textColor }]}>
          {selectedProduct ? 'Filial Seçin' : 'Məhsul Seçin'}
        </Text>
        
        {!selectedProduct ? (
          <BottomSheetScrollView 
            contentContainerStyle={styles.bottomSheetScrollViewContent}
            style={{ backgroundColor: contentBgColor }}
          >
            {productStats.map((stat, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.bottomSheetItem,
                  { 
                    backgroundColor: itemBgColor, 
                    borderColor: borderColor,
                    shadowColor: isDark ? '#000' : '#4A3531',
                    shadowOpacity: isDark ? 0.3 : 0.1,
                  },
                  selectedProduct === stat.productName && { 
                    backgroundColor: selectedBgColor,
                    borderColor: selectedBgColor,
                  }
                ]}
                onPress={() => {
                  setSelectedProduct(stat.productName);
                  setAvailableBranches(Object.keys(stat.branchStats));
                }}
              >
                <View style={styles.bottomSheetItemContent}>
                  <Text style={[
                    styles.bottomSheetItemText,
                    { color: textColor },
                    selectedProduct === stat.productName && styles.selectedItemText
                  ]}>
                    {stat.productName}
                  </Text>
                  <Text style={[
                    styles.bottomSheetItemSubtext,
                    { color: secondaryTextColor },
                    selectedProduct === stat.productName && styles.selectedItemText
                  ]}>
                    Ümumi: {stat.totalQuantity} ədəd
                  </Text>
                </View>
                <AntDesign 
                  name="right" 
                  size={20} 
                  color={selectedProduct === stat.productName ? '#fff' : textColor} 
                />
              </TouchableOpacity>
            ))}
          </BottomSheetScrollView>
        ) : (
          <View style={[styles.branchSelectionContainer, { backgroundColor: contentBgColor }]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setSelectedProduct('')}
            >
              <AntDesign name="left" size={20} color={textColor} />
              <Text style={[styles.backButtonText, { color: textColor }]}>Geri</Text>
            </TouchableOpacity>

            <BottomSheetScrollView 
              contentContainerStyle={styles.bottomSheetScrollViewContent}
              style={{ backgroundColor: contentBgColor }}
            >
              {availableBranches.map((branch, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.bottomSheetItem,
                    { 
                      backgroundColor: itemBgColor, 
                      borderColor: borderColor,
                      shadowColor: isDark ? '#000' : '#4A3531',
                      shadowOpacity: isDark ? 0.3 : 0.1,
                    },
                    selectedBranch === branch && { 
                      backgroundColor: selectedBgColor,
                      borderColor: selectedBgColor,
                    }
                  ]}
                  onPress={() => {
                    setSelectedBranch(branch);
                    bottomSheetModalRef.current?.dismiss();
                  }}
                >
                  <Text style={[
                    styles.bottomSheetItemText,
                    { color: textColor },
                    selectedBranch === branch && styles.selectedItemText
                  ]}>
                    {branch}
                  </Text>
                  <AntDesign 
                    name="check" 
                    size={20} 
                    color={selectedBranch === branch ? '#fff' : 'transparent'} 
                  />
                </TouchableOpacity>
              ))}
            </BottomSheetScrollView>
          </View>
        )}
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetIndicator: {
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
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    elevation: 3,
  },
  bottomSheetItemContent: {
    flex: 1,
  },
  bottomSheetItemText: {
    fontSize: 18,
    marginBottom: 4,
  },
  bottomSheetItemSubtext: {
    fontSize: 14,
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
    marginLeft: 8,
  },
}); 