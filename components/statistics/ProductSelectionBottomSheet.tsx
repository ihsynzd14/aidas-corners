import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, useColorScheme as useNativeColorScheme, Modal, Pressable, Animated, FlatList, Dimensions } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { colorScheme } from '@/constants/colorScheme';

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
  visible: boolean;
  selectedProduct: string;
  selectedBranch: string;
  productStats: ProductStats[];
  availableBranches: string[];
  setSelectedProduct: (product: string) => void;
  setSelectedBranch: (branch: string) => void;
  setAvailableBranches: (branches: string[]) => void;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;

export const ProductSelectionBottomSheet: React.FC<ProductSelectionBottomSheetProps> = ({
  visible,
  selectedProduct,
  selectedBranch,
  productStats,
  availableBranches,
  setSelectedProduct,
  setSelectedBranch,
  setAvailableBranches,
  onClose,
}) => {
  const nativeColorScheme = useNativeColorScheme();
  const isDark = nativeColorScheme === 'dark';

  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShowModal(false));
    }
  }, [visible]);

  const handleBackdropPress = () => {
    onClose();
  };

  const handleProductSelect = (productName: string) => {
    setSelectedProduct(productName);
    const product = productStats.find(p => p.productName === productName);
    if (product) {
      setAvailableBranches(Object.keys(product.branchStats));
    }
  };

  const handleBranchSelect = (branch: string) => {
    setSelectedBranch(branch);
    onClose();
  };

  const handleBackPress = () => {
    setSelectedProduct('');
  };

  const renderProductItem = ({ item }: { item: ProductStats }) => (
    <TouchableOpacity
      style={[
        styles.bottomSheetItem,
        {
          backgroundColor: isDark ? colorScheme.cardDark : colorScheme.cardLight,
          borderColor: colorScheme.borderRed,
        },
        selectedProduct === item.productName && {
          backgroundColor: colorScheme.accentRed,
          borderColor: colorScheme.accentRed,
        },
      ]}
      onPress={() => handleProductSelect(item.productName)}
    >
      <View style={styles.bottomSheetItemContent}>
        <Text
          style={[
            styles.bottomSheetItemText,
            { color: isDark ? colorScheme.textDark : colorScheme.textLight },
            selectedProduct === item.productName && styles.selectedItemText,
          ]}
        >
          {item.productName}
        </Text>
        <Text
          style={[
            styles.bottomSheetItemSubtext,
            { color: isDark ? colorScheme.textSubtleDark : colorScheme.textSubtleLight },
            selectedProduct === item.productName && styles.selectedItemText,
          ]}
        >
          Ümumi: {item.totalQuantity} ədəd
        </Text>
      </View>
      <AntDesign
        name="right"
        size={20}
        color={selectedProduct === item.productName ? '#FFFFFF' : colorScheme.accentRed}
      />
    </TouchableOpacity>
  );

  const renderBranchItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.bottomSheetItem,
        {
          backgroundColor: isDark ? colorScheme.cardDark : colorScheme.cardLight,
          borderColor: colorScheme.borderRed,
        },
        selectedBranch === item && {
          backgroundColor: colorScheme.accentRed,
          borderColor: colorScheme.accentRed,
        },
      ]}
      onPress={() => handleBranchSelect(item)}
    >
      <Text
        style={[
          styles.bottomSheetItemText,
          { color: isDark ? colorScheme.textDark : colorScheme.textLight },
          selectedBranch === item && styles.selectedItemText,
        ]}
      >
        {item}
      </Text>
      <AntDesign
        name="check"
        size={20}
        color={selectedBranch === item ? '#FFFFFF' : 'transparent'}
      />
    </TouchableOpacity>
  );

  if (!showModal) return null;

  return (
    <Modal visible={showModal} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <Animated.View style={[styles.backdropAnimated, { opacity: fadeAnim }]}>
          <Animated.View
            style={[
              styles.bottomSheetContainer,
              {
                backgroundColor: isDark ? colorScheme.backgroundDark : colorScheme.backgroundLight,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.bottomSheetContent}>
              <View style={styles.handleContainer}>
                <View style={[styles.handleBar, { backgroundColor: isDark ? colorScheme.textSubtleDark : colorScheme.textSubtleLight }]} />
              </View>

              {!selectedProduct ? (
                <>
                  <Text style={[styles.bottomSheetMainTitle, { color: isDark ? colorScheme.textDark : colorScheme.textLight }]}>
                    Məhsul Seçin
                  </Text>
                  <FlatList
                    data={productStats}
                    keyExtractor={(item, index) => `product-${index}`}
                    renderItem={renderProductItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={true}
                    style={styles.flatList}
                  />
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                    <AntDesign name="left" size={20} color={isDark ? colorScheme.textDark : colorScheme.textLight} />
                    <Text style={[styles.backButtonText, { color: isDark ? colorScheme.textDark : colorScheme.textLight }]}>
                      Geri
                    </Text>
                  </TouchableOpacity>

                  <Text style={[styles.bottomSheetMainTitle, { color: isDark ? colorScheme.textDark : colorScheme.textLight }]}>
                    Filial Seçin
                  </Text>
                  <FlatList
                    data={availableBranches}
                    keyExtractor={(item, index) => `branch-${index}`}
                    renderItem={renderBranchItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={true}
                    style={styles.flatList}
                  />
                </>
              )}
            </View>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropAnimated: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 24,
    paddingBottom: 40,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  bottomSheetMainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  flatList: {
    flex: 1,
  },
  bottomSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
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
    color: '#FFFFFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
});
