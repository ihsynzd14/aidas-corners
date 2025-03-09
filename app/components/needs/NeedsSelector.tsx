'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Modal,
  PanResponder,
  Animated,
  TouchableWithoutFeedback
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';

interface Need {
  id: string;
  name: string;
  price: string;
  unit: string;
  createdAt: number;
}

interface NeedsSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  needs: Need[];
  onSelectNeed: (needs: Need[]) => void;
  initialSelectedNeeds?: Need[];
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SNAP_POINTS = {
  INITIAL: SCREEN_HEIGHT * 0.5,
  MIDDLE: SCREEN_HEIGHT * 0.8,
  TOP: SCREEN_HEIGHT * 0.95
};
const DRAG_THRESHOLD = 50; // Kapatma için sürükleme eşiği

export default function NeedsSelector({ 
  isOpen, 
  onClose, 
  needs, 
  onSelectNeed, 
  initialSelectedNeeds = [] 
}: NeedsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeeds, setSelectedNeeds] = useState<Need[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const initializedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Animasyon değerleri
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const translateY = panY.interpolate({
    inputRange: [0, SCREEN_HEIGHT],
    outputRange: [0, SCREEN_HEIGHT],
    extrapolate: 'clamp',
  });

  // Modal yüksekliği için state
  const [modalHeight, setModalHeight] = useState(SNAP_POINTS.INITIAL);
  
  // PanResponder oluştur
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Sadece aşağı sürüklemeye izin ver
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        } else if (gestureState.dy < 0 && modalHeight < SNAP_POINTS.TOP) {
          // Yukarı sürükleme - modal yüksekliğini artır
          const newHeight = Math.min(
            modalHeight - gestureState.dy,
            SNAP_POINTS.TOP
          );
          setModalHeight(newHeight);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > DRAG_THRESHOLD) {
          // Aşağı sürükleme eşiği aşıldı, modal'ı kapat
          closeModal();
        } else if (gestureState.dy < -DRAG_THRESHOLD) {
          // Yukarı sürükleme eşiği aşıldı, bir sonraki snap noktasına git
          snapToNextPoint();
        } else {
          // Eşik aşılmadı, mevcut konuma geri dön
          resetPosition();
        }
      },
    })
  ).current;

  // Bir sonraki snap noktasına git
  const snapToNextPoint = () => {
    if (modalHeight < SNAP_POINTS.MIDDLE) {
      setModalHeight(SNAP_POINTS.MIDDLE);
    } else {
      setModalHeight(SNAP_POINTS.TOP);
    }
    resetPosition();
  };

  // Modal'ı kapat
  const closeModal = () => {
    Animated.timing(panY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  // Pozisyonu sıfırla
  const resetPosition = () => {
    Animated.spring(panY, {
      toValue: 0,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  // Modal açıldığında
  useEffect(() => {
    if (isOpen) {
      console.log('NeedsSelector açıldı');
      setModalHeight(SNAP_POINTS.INITIAL);
      
      // Modal'ı aç
      Animated.spring(panY, {
        toValue: 0,
        bounciness: 5,
        useNativeDriver: true,
      }).start();
      
      // Seçimleri ayarla ve arama sorgusunu temizle
      setSelectedNeeds(Array.isArray(initialSelectedNeeds) ? initialSelectedNeeds : []);
      setSearchQuery('');
      initializedRef.current = true;
      
      // Veri yükleme durumunu kontrol et
      if (Array.isArray(needs)) {
        console.log(`NeedsSelector: ${needs.length} adet ərzaq var`);
        setIsLoading(false);
      } else {
        console.warn('NeedsSelector: needs dizisi geçerli değil');
        setIsLoading(true);
        
        // Veri yükleme durumunu 2 saniye sonra kapat (veri yoksa bile)
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    } else {
      // Modal kapandığında referansı sıfırla
      initializedRef.current = false;
    }
  }, [isOpen, needs, panY]); // isOpen ve needs değiştiğinde çalış

  // Arama sorgusuna göre filtreleme
  const filteredNeeds = Array.isArray(needs) ? needs.filter(need => 
    need.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Debug için
  useEffect(() => {
    if (isOpen) {
      console.log(`NeedsSelector: filteredNeeds uzunluğu: ${filteredNeeds.length}`);
      if (filteredNeeds.length > 0) {
        console.log('İlk 3 öğe:', filteredNeeds.slice(0, 3).map(n => n.name).join(', '));
      }
    }
  }, [isOpen, filteredNeeds.length]);

  // Öğe seçim durumunu değiştir
  const handleNeedToggle = (need: Need) => {
    setSelectedNeeds(prev => {
      const isSelected = prev.some(item => item.id === need.id);
      if (isSelected) {
        return prev.filter(item => item.id !== need.id);
      } else {
        return [...prev, need];
      }
    });
  };

  // Seçimleri onayla
  const handleConfirm = () => {
    onSelectNeed(selectedNeeds);
    closeModal();
  };

  // Tüm seçimleri temizle
  const handleClearAll = () => {
    setSelectedNeeds([]);
  };

  // Öğe render fonksiyonu
  const renderNeedItem = ({ item }: { item: Need }) => {
    const isSelected = selectedNeeds.some(need => need.id === item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.needItem,
          isSelected && styles.selectedNeedItem
        ]}
        onPress={() => handleNeedToggle(item)}
        activeOpacity={0.7}
      >
        <View style={styles.needInfo}>
          <Text style={styles.needName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          <View style={styles.needDetails}>
            <Text style={styles.needPrice}>{item.price} AZN</Text>
            <Text style={styles.needUnit}> / {item.unit}</Text>
          </View>
        </View>
        
        <View style={[
          styles.checkboxContainer,
          isSelected && styles.selectedCheckboxContainer
        ]}>
          {isSelected && (
            <MaterialIcons name="check" size={18} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Boş durum gösterimi
  const renderEmptyState = () => {
    // Arama yapılmışsa ve sonuç yoksa
    if (searchQuery.length > 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialIcons name="search-off" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>Ərzaq tapılmadı</Text>
          <Text style={styles.emptyStateText}>
            "{searchQuery}" ilə uyğun ərzaq yoxdur
          </Text>
        </View>
      );
    }
    
    // Hiç veri yoksa
    if (needs.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialIcons name="inventory" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>Ərzaq siyahısı boşdur</Text>
          <Text style={styles.emptyStateText}>
            Ərzaq siyahısında heç bir məhsul yoxdur.{'\n'}
            Zəhmət olmasa əvvəlcə ərzaq əlavə edin.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 1000);
            }}
          >
            <MaterialIcons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Yenidən yüklə</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Filtrelenmiş veri yoksa
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="filter-list-off" size={48} color="#D1D5DB" />
        <Text style={styles.emptyStateTitle}>Filtrlənmiş nəticə yoxdur</Text>
        <Text style={styles.emptyStateText}>
          Filtrlənmiş nəticə tapılmadı.{'\n'}
          Zəhmət olmasa filtri dəyişdirin.
        </Text>
      </View>
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="none"
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <Animated.View 
          style={[
            styles.modalContainer,
            { 
              transform: [{ translateY }],
              height: modalHeight,
            }
          ]}
        >
          {/* Handle indicator - sürüklenebilir alan */}
          <View 
            style={styles.handleIndicatorContainer}
            {...panResponder.panHandlers}
          >
            <View style={styles.handleIndicator} />
          </View>
          
          {/* Debug bilgisi */}
          <View style={styles.debugBar}>
            <Text style={styles.debugText}>
              Toplam: {needs.length} | Filtrelenmiş: {filteredNeeds.length} | Seçili: {selectedNeeds.length}
            </Text>
          </View>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.title}>Ərzaq seçin</Text>
              {selectedNeeds.length > 0 && (
                <View style={styles.selectedCountBadge}>
                  <Text style={styles.selectedCountText}>{selectedNeeds.length}</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={closeModal}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          {/* Arama */}
          <View style={[
            styles.searchContainer,
            isSearchFocused && styles.searchContainerFocused
          ]}>
            <MaterialIcons 
              name="search" 
              size={20} 
              color={isSearchFocused ? "#F59E0B" : "#9CA3AF"} 
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Ərzaq axtar..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <MaterialIcons name="clear" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Seçim bilgisi */}
          {selectedNeeds.length > 0 && (
            <View style={styles.selectionInfoContainer}>
              <Text style={styles.selectionInfoText}>
                {selectedNeeds.length} ərzaq seçildi
              </Text>
              <TouchableOpacity 
                onPress={handleClearAll}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Text style={styles.clearAllText}>Hamısını təmizlə</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Liste */}
          <View style={styles.needsList}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text style={styles.loadingText}>Ərzaqlar yüklənir...</Text>
              </View>
            ) : needs.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="error-outline" size={48} color="#EF4444" />
                <Text style={styles.emptyStateTitle}>Ərzaq məlumatları tapılmadı</Text>
                <Text style={styles.emptyStateText}>
                  Ərzaq siyahısı yüklənərkən xəta baş verdi. 
                  Zəhmət olmasa əvvəlcə ərzaq əlavə edin.
                </Text>
              </View>
            ) : filteredNeeds.length === 0 ? (
              renderEmptyState()
            ) : (
              <View style={styles.flatListContainer}>
                <Text style={styles.debugInfo}>Yüklənən ərzaq sayısı: {needs.length}</Text>
                <Text style={styles.debugInfo}>Filtrlənmiş ərzaq sayısı: {filteredNeeds.length}</Text>
                <FlatList
                  data={filteredNeeds}
                  renderItem={renderNeedItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.listContent}
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={10}
                  maxToRenderPerBatch={20}
                  windowSize={10}
                />
              </View>
            )}
          </View>
          
          {/* Butonlar */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={closeModal}
            >
              <Text style={styles.cancelButtonText}>İmtina</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                selectedNeeds.length === 0 && styles.disabledButton
              ]} 
              onPress={handleConfirm}
              disabled={selectedNeeds.length === 0}
            >
              <Text style={styles.confirmButtonText}>
                {selectedNeeds.length > 0 
                  ? `Təsdiq et (${selectedNeeds.length})` 
                  : 'Təsdiq et'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handleIndicatorContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  contentContainer: {
    flex: 1,
  },
  debugBar: {
    backgroundColor: '#F3F4F6',
    padding: 4,
    alignItems: 'center',
  },
  debugText: {
    fontSize: 10,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  selectedCountBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  selectedCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    margin: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchContainerFocused: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    marginLeft: 8,
    color: '#111827',
  },
  selectionInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  selectionInfoText: {
    fontSize: 14,
    color: '#4B5563',
  },
  clearAllText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
  },
  needsList: {
    flex: 1,
    paddingHorizontal: 16,
    minHeight: 200, // Minimum yükseklik ekle
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
  },
  listContent: {
    paddingBottom: 16,
    minHeight: 200, // Minimum yükseklik ekle
  },
  needItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedNeedItem: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  needInfo: {
    flex: 1,
    marginRight: 12,
  },
  needName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  needDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  needPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F59E0B',
  },
  needUnit: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckboxContainer: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#FDE68A',
    opacity: 0.7,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  flatListContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 8,
  },
  debugInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
}); 