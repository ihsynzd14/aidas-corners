import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Platform, ColorSchemeName, Animated, Dimensions, Alert, FlatList, RefreshControl } from 'react-native';
import { TopBar } from '@/components/TopBar';
import { Colors, PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { addNeed, getNeeds, deleteNeed, updateNeed } from '@/utils/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface NeedFormData {
  name: string;
  price: string;
  unit: string;
}

interface Need {
  id: string;
  name: string;
  price: string;
  unit: string;
  createdAt: number;
}

interface AddButtonProps {
  onPress: () => void;
  theme: 'light' | 'dark';
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AddButton: React.FC<AddButtonProps> = React.memo(({ onPress, theme }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.addButton, { backgroundColor: theme === 'dark' ? PastryColors.chocolate : PastryColors.vanilla }]}
  >
    <Text style={[styles.addButtonText, { color: theme === 'dark' ? '#FFFFFF' : '#000000' }]}>
      Əlavə et
    </Text>
  </TouchableOpacity>
));

const ErzaqlarScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [editingNeed, setEditingNeed] = useState<Need | null>(null);
  const [formData, setFormData] = useState<NeedFormData>({
    name: '',
    price: '',
    unit: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const colors = Colors[theme];
  const router = useRouter();

  useEffect(() => {
    fetchNeeds();
  }, []);

  const fetchNeeds = async () => {
    try {
      setIsLoading(true);
      const needsData = await getNeeds();
      setNeeds(needsData);
    } catch (error) {
      console.error('Error fetching needs:', error);
      Alert.alert('Xəta', 'Məhsullar yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof NeedFormData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      unit: ''
    });
    setEditingNeed(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Xəta', 'Məhsulun adını daxil edin');
      return false;
    }

    if (!formData.price.trim()) {
      Alert.alert('Xəta', 'Qiyməti daxil edin');
      return false;
    }

    if (!formData.unit.trim()) {
      Alert.alert('Xəta', 'Ölçü vahidini daxil edin');
      return false;
    }

    return true;
  };

  const handleAddItem = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await addNeed({
        name: formData.name.trim(),
        price: formData.price.trim(),
        unit: formData.unit.trim(),
      });

      setModalVisible(false);
      resetForm();
      fetchNeeds();
      Alert.alert('Uğurlu', 'Məhsul əlavə edildi');
    } catch (error) {
      console.error('Error adding need:', error);
      Alert.alert('Xəta', 'Məhsul əlavə edilərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingNeed || !validateForm()) return;

    try {
      setIsLoading(true);
      await updateNeed(editingNeed.id, {
        name: formData.name.trim(),
        price: formData.price.trim(),
        unit: formData.unit.trim(),
      });

      setModalVisible(false);
      resetForm();
      fetchNeeds();
      Alert.alert('Uğurlu', 'Məhsul yeniləndi');
    } catch (error) {
      console.error('Error updating need:', error);
      Alert.alert('Xəta', 'Məhsul yenilənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (needId: string) => {
    Alert.alert(
      'Diqqət',
      'Bu məhsulu silmək istədiyinizə əminsiniz?',
      [
        { text: 'Ləğv et', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteNeed(needId);
              fetchNeeds();
              Alert.alert('Uğurlu', 'Məhsul silindi');
            } catch (error) {
              console.error('Error deleting need:', error);
              Alert.alert('Xəta', 'Məhsul silinərkən xəta baş verdi');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEditItem = (need: Need) => {
    setEditingNeed(need);
    setFormData({
      name: need.name,
      price: need.price,
      unit: need.unit
    });
    setModalVisible(true);
  };

  const handleAddButtonClick = () => {
    resetForm();
    setEditingNeed(null);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Need }) => (
    <View style={[
      styles.needItem, 
      { 
        backgroundColor: theme === 'dark' ? Colors.dark.background : Colors.light.background,
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      }
    ]}>
      <MaterialCommunityIcons 
        name="cookie" 
        size={24} 
        color={theme === 'dark' ? '#FFFFFF' : PastryColors.chocolate}
        style={styles.cardCookieIcon}
      />
      <View style={styles.needInfo}>
        <Text style={[styles.needName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.needPrice, { color: colors.text }]} numberOfLines={1}>
          {item.price} AZN / {item.unit}
        </Text>
      </View>
      <View style={styles.needActions}>
        <TouchableOpacity
          onPress={() => handleEditItem(item)}
          style={[
            styles.iconButton, 
            { 
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : PastryColors.vanilla,
              borderColor: theme === 'dark' ? '#FFFFFF' : PastryColors.chocolate,
              borderWidth: 1,
            }
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.iconText, { color: theme === 'dark' ? '#FFFFFF' : PastryColors.chocolate }]}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteItem(item.id)}
          style={[
            styles.iconButton, 
            { 
              backgroundColor: theme === 'dark' ? 'rgba(255,0,0,0.2)' : 'rgba(255,0,0,0.1)',
              borderColor: Colors.danger,
              borderWidth: 1,
            }
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.iconText, { color: Colors.danger }]}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleBack = () => {
    router.back();
  };

  const handleCloseModal = () => {
    if (!isLoading) {
      setModalVisible(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchNeeds();
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Ərzaqlar" 
        style={styles.topBar}
        leftComponent={{ icon: 'back', onPress: handleBack }}
        rightComponent={<AddButton onPress={handleAddButtonClick} theme={theme} />}
      />

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme === 'dark' ? '#FFFFFF' : colors.textSecondary }]}>
            Yüklənir...
          </Text>
        </View>
      ) : !needs.length ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="cookie" 
            size={64} 
            color={theme === 'dark' ? '#FFFFFF' : PastryColors.chocolate} 
            style={styles.cookieIcon}
          />
          <Text style={[styles.emptyText, { color: theme === 'dark' ? '#FFFFFF' : colors.textSecondary }]}>
            Hələ heç bir ərzaq əlavə edilməyib
          </Text>
          <TouchableOpacity
            onPress={handleAddButtonClick}
            style={[styles.emptyButton, { borderWidth: 0.70, backgroundColor: theme === 'dark' ? PastryColors.chocolate : PastryColors.vanilla }]}
          >
            <Text style={[styles.emptyButtonText, { color: theme === 'dark' ? '#FFFFFF' : PastryColors.chocolate }]}>
              İlk ərzağı əlavə et
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={needs}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PastryColors.chocolate]}
              tintColor={theme === 'dark' ? '#FFFFFF' : PastryColors.chocolate}
            />
          }
        />
      )}

      {/* Modal Background Overlay */}
      {modalVisible && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        />
      )}
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalWrapper}>
          <View style={[
            styles.modalContent, 
            { 
              backgroundColor: theme === 'dark' ? PastryColors.chocolate : Colors.light.background,
              borderColor: theme === 'dark' ? '#432818' : Colors.light.text
            }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingNeed ? 'Məhsulu yenilə' : 'Yeni Ərzaq'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={isLoading}
              >
                <Text style={[styles.closeButtonText, { color: theme === 'dark' ? '#8E8E93' : '#6B6B6B' }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.nameContainer}>
                <Text style={[styles.label, { color: theme === 'dark' ? '#FFFFFF' : '#6B6B6B' }]}>
                  Ad
                </Text>
                <TextInput
                  style={[
                    styles.nameInput, 
                    { 
                      backgroundColor: theme === 'dark' ? '#2C2C2E' : '#F5F5F5',
                      color: colors.text,
                      borderColor: theme === 'dark' ? '#8E8E93' : '#D9D9D9'
                    }
                  ]}
                  placeholder="Məhsulun adı"
                  placeholderTextColor={theme === 'dark' ? '#8E8E93' : '#A3A3A3'}
                  value={formData.name}
                  onChangeText={handleInputChange('name')}
                  editable={!isLoading}
                />
              </View>
              
              <View style={styles.detailsRow}>
                <View style={styles.priceContainer}>
                  <Text style={[styles.label, { color: theme === 'dark' ? '#FFFFFF' : '#6B6B6B' }]}>
                    Qiymət
                  </Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: theme === 'dark' ? '#2C2C2E' : '#F5F5F5',
                        color: colors.text,
                        borderColor: theme === 'dark' ? '#8E8E93' : '#D9D9D9'
                      }
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={theme === 'dark' ? '#8E8E93' : '#A3A3A3'}
                    value={formData.price}
                    onChangeText={handleInputChange('price')}
                    keyboardType="numeric"
                    editable={!isLoading}
                  />
                </View>
                
                <View style={styles.unitContainer}>
                  <Text style={[styles.label, { color: theme === 'dark' ? '#FFFFFF' : '#6B6B6B' }]}>
                    Ölçü
                  </Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: theme === 'dark' ? '#2C2C2E' : '#F5F5F5',
                        color: colors.text,
                        borderColor: theme === 'dark' ? '#8E8E93' : '#D9D9D9'
                      }
                    ]}
                    autoCapitalize="none"
                    placeholder="ədəd/kg/lt/ml"
                    placeholderTextColor={theme === 'dark' ? '#8E8E93' : '#A3A3A3'}
                    value={formData.unit}
                    onChangeText={handleInputChange('unit')}
                    editable={!isLoading}
                  />
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCloseModal}
                disabled={isLoading}
              >
                <Text style={[styles.buttonText, {color: theme === 'dark' ? '#FF453A' : '#FF3B30' }]}>
                  Ləğv et
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.saveButton, 
                  { 
                    borderWidth: 0.3, 
                    borderColor: theme === 'dark' ? '#3E2C28' : '#533C37',
                    backgroundColor: theme === 'dark' ? '#3E2C28' : '#EEE1CA',
                    opacity: isLoading ? 0.7 : 1
                  }
                ]}
                onPress={editingNeed ? handleUpdateItem : handleAddItem}
                disabled={isLoading}
              >
                <Text style={[styles.buttonText, {color: theme === 'dark' ? '#FFFFFF' : PastryColors.chocolate }]}>
                  {isLoading ? (editingNeed ? 'Yenilənir...' : 'Əlavə edilir...') : (editingNeed ? 'Yenilə' : 'Əlavə et')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  container: {
    flex: 1,
  },
  addButton: {
    borderColor: PastryColors.chocolate,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '400',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 32,
  },
  nameContainer: {
    marginBottom: 24,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  unitContainer: {
    flex: 2,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 56,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 56,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  needItem: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 0,
    shadowColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCookieIcon: {
    marginRight: 12,
  },
  needInfo: {
    flex: 1,
    marginRight: 12,
  },
  needName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
    priceContainer: {
    flex: 2,
    marginRight: 42,
  },
  needPrice: {
    fontSize: 14,
    color: '#666',
  },
  needActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cookieIcon: {
    marginBottom: 16,
  },
});

export default ErzaqlarScreen;
