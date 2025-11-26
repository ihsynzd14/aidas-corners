import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { 
  addProductCorrection, 
  updateProductCorrection, 
  deleteProductCorrection,
  ProductDefinition 
} from '@/utils/firebase';
import { refreshProductCorrections } from '@/utils/orderCorrection';

interface ProductManagementModalProps {
  visible: boolean;
  onClose: () => void;
  editingProduct?: ProductDefinition | null;
}

export function ProductManagementModal({ 
  visible, 
  onClose, 
  editingProduct 
}: ProductManagementModalProps) {
  const [productName, setProductName] = useState('');
  const [variations, setVariations] = useState('');
  const [unitType, setUnitType] = useState<'weight' | 'piece' | 'box'>('piece');
  const [unitVariations, setUnitVariations] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const isDark = useColorScheme() === 'dark';

  // Reset form when modal opens/closes or editing product changes
  useEffect(() => {
    if (visible) {
      if (editingProduct) {
        setProductName(editingProduct.correct);
        setVariiations(editingProduct.variations.join(', '));
        setUnitType(editingProduct.units?.type || 'piece');
        setUnitVariations(editingProduct.units?.variations?.join(', ') || '');
        setIsDeleteMode(false);
      } else {
        // Clear form for new product
        setProductName('');
        setVariiations('');
        setUnitType('piece');
        setUnitVariations('');
        setIsDeleteMode(false);
      }
    }
  }, [visible, editingProduct]);

  const handleSave = async () => {
    if (!productName.trim()) {
      Alert.alert('Xəta', 'Məhsul adı daxil edin');
      return;
    }

    try {
      setLoading(true);
      const variationsArray = variations
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);

      const unitVariationsArray = unitVariations
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);

      const productData = {
        correct: productName.trim(),
        variations: variationsArray,
        units: unitVariationsArray.length > 0 ? {
          type: unitType,
          variations: unitVariationsArray
        } : undefined,
        isActive: true
      };

      if (editingProduct) {
        await updateProductCorrection(editingProduct.id!, productData);
        Alert.alert('Uğurlu', 'Məhsul uğurla yeniləndi');
      } else {
        await addProductCorrection(productData);
        Alert.alert('Uğurlu', 'Yeni məhsul uğurla əlavə edildi');
      }

      // Refresh product list
      await refreshProductCorrections();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Xəta', 'Məhsul saxlanarkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingProduct) return;

    Alert.alert(
      'Məhsulu Sil',
      `"${editingProduct.correct}" məhsulunu silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.`,
      [
        { text: 'İmtina', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteProductCorrection(editingProduct.id!);
              Alert.alert('Uğurlu', 'Məhsul uğurla silindi');
              await refreshProductCorrections();
              onClose();
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Xəta', 'Məhsul silinərkən xəta baş verdi');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const unitTypes = [
    { label: 'Ədəd', value: 'piece' },
    { label: 'Çəki (kq)', value: 'weight' },
    { label: 'Qutu', value: 'box' }
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <ThemedView style={{
            backgroundColor: isDark ? '#2A2A2A' : '#FFF',
            borderRadius: 16,
            padding: 20,
            width: '100%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              marginBottom: 20,
              textAlign: 'center',
              color: isDark ? '#FFF' : '#000',
            }}>
              {editingProduct ? 'Məhsulu Düzəlt' : 'Yeni Məhsul'}
            </Text>

            {/* Product Name */}
            <Text style={{
              fontSize: 16,
              marginBottom: 8,
              color: isDark ? '#FFF' : '#000',
            }}>
              Məhsul Adı:
            </Text>
            <TextInput
              style={{
                backgroundColor: isDark ? '#333' : '#F5F5F5',
                borderWidth: 1,
                borderColor: isDark ? '#555' : '#DDD',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                color: isDark ? '#FFF' : '#000',
              }}
              value={productName}
              onChangeText={setProductName}
              placeholder="Düzgün yazılış..."
              placeholderTextColor={isDark ? '#999' : '#666'}
            />

            {/* Variations */}
            <Text style={{
              fontSize: 16,
              marginBottom: 8,
              color: isDark ? '#FFF' : '#000',
            }}>
              Yanlış Yazılışlar (vergülle ayrılmış):
            </Text>
            <TextInput
              style={{
                backgroundColor: isDark ? '#333' : '#F5F5F5',
                borderWidth: 1,
                borderColor: isDark ? '#555' : '#DDD',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                height: 80,
                textAlignVertical: 'top',
                color: isDark ? '#FFF' : '#000',
              }}
              value={variations}
              onChangeText={setVariations}
              placeholder="şokolad, sokolad, shokolad..."
              placeholderTextColor={isDark ? '#999' : '#666'}
              multiline
            />

            {/* Unit Type */}
            <Text style={{
              fontSize: 16,
              marginBottom: 8,
              color: isDark ? '#FFF' : '#000',
            }}>
              Ölçü Vahidi:
            </Text>
            <View style={{
              backgroundColor: isDark ? '#333' : '#F5F5F5',
              borderWidth: 1,
              borderColor: isDark ? '#555' : '#DDD',
              borderRadius: 8,
              marginBottom: 16,
            }}>
              <Picker
                selectedValue={unitType}
                onValueChange={(itemValue: string) => setUnitType(itemValue as any)}
                style={{ color: isDark ? '#FFF' : '#000' }}
              >
                {unitTypes.map((type) => (
                  <Picker.Item key={type.value} label={type.label} value={type.value} />
                ))}
              </Picker>
            </View>

            {/* Unit Variations */}
            <Text style={{
              fontSize: 16,
              marginBottom: 8,
              color: isDark ? '#FFF' : '#000',
            }}>
              Ölçü Variasiyaları (vergülle ayrılmış):
            </Text>
            <TextInput
              style={{
                backgroundColor: isDark ? '#333' : '#F5F5F5',
                borderWidth: 1,
                borderColor: isDark ? '#555' : '#DDD',
                borderRadius: 8,
                padding: 12,
                marginBottom: 24,
                color: isDark ? '#FFF' : '#000',
              }}
              value={unitVariations}
              onChangeText={setUnitVariations}
              placeholder="kq, kg, kilo, kiloqram..."
              placeholderTextColor={isDark ? '#999' : '#666'}
            />

            {/* Action Buttons */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 12,
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 8,
                  backgroundColor: isDark ? '#444' : '#EEE',
                  alignItems: 'center',
                }}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={{ color: isDark ? '#FFF' : '#000' }}>
                  İmtina
                </Text>
              </TouchableOpacity>

              {editingProduct && !isDeleteMode && (
                <TouchableOpacity
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 8,
                    backgroundColor: '#E74C3C',
                    alignItems: 'center',
                  }}
                  onPress={() => setIsDeleteMode(true)}
                  disabled={loading}
                >
                  <Text style={{ color: '#FFF' }}>
                    Sil
                  </Text>
                </TouchableOpacity>
              )}

              {isDeleteMode ? (
                <TouchableOpacity
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 8,
                    backgroundColor: '#E74C3C',
                    alignItems: 'center',
                  }}
                  onPress={handleDelete}
                  disabled={loading}
                >
                  <Text style={{ color: '#FFF' }}>
                    {loading ? 'Silinir...' : 'Silindi'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 8,
                    backgroundColor: '#4CAF50',
                    alignItems: 'center',
                  }}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={{ color: '#FFF' }}>
                    {loading ? 'Saxlanır...' : 'Yadda Saxla'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ThemedView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}