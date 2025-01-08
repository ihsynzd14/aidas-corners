import React, { useState, useEffect } from 'react';
import { Modal, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (productName: string, quantity: string) => void;
  initialProduct?: string;
  initialQuantity?: string;
  isNewProduct?: boolean;
}

export function EditModal({ 
  visible, 
  onClose, 
  onSave, 
  initialProduct = '', 
  initialQuantity = '', 
  isNewProduct = false 
}: EditModalProps) {
  const [productName, setProductName] = useState(initialProduct);
  const [quantity, setQuantity] = useState(initialQuantity);
  const isDark = useColorScheme() === 'dark';

  // Reset form values when the modal becomes visible
  useEffect(() => {
    if (visible) {
      setProductName(initialProduct);
      setQuantity(initialQuantity);
    }
  }, [visible, initialProduct, initialQuantity]);

  const handleSave = () => {
    if (!productName.trim() || !quantity.trim()) {
      Alert.alert('Xəta', 'Zəhmət olmasa bütün sahələri doldurun');
      return;
    }
    onSave(productName, quantity);
    onClose();
  };

  // Reset form when modal is closed
  const handleClose = () => {
    setProductName('');
    setQuantity('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
      }}>
        <ThemedView style={{
          backgroundColor: isDark ? '#2A2A2A' : '#FFF',
          borderRadius: 16,
          padding: 20,
        }}>
          <ThemedText style={{ 
            fontSize: 20, 
            fontWeight: '600', 
            marginBottom: 20,
            color: isDark ? PastryColors.vanilla : PastryColors.chocolate
          }}>
            {isNewProduct ? 'Yeni Məhsul' : 'Məhsulu Düzəlt'}
          </ThemedText>
          
          <ThemedText style={{ marginBottom: 8 }}>Məhsul adı:</ThemedText>
          <TextInput
            value={productName}
            onChangeText={setProductName}
            style={{
              backgroundColor: isDark ? '#333' : '#F5F5F5',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              color: isDark ? '#FFF' : '#000',
            }}
            placeholderTextColor={isDark ? '#999' : '#666'}
          />
          
          <ThemedText style={{ marginBottom: 8 }}>Miqdar:</ThemedText>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            style={{
              backgroundColor: isDark ? '#333' : '#F5F5F5',
              padding: 12,
              borderRadius: 8,
              marginBottom: 20,
              color: isDark ? '#FFF' : '#000',
            }}
            placeholderTextColor={isDark ? '#999' : '#666'}
          />
          
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                padding: 12,
                borderRadius: 8,
                backgroundColor: isDark ? '#444' : '#EEE',
              }}
            >
              <ThemedText>İmtina</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSave}
              style={{
                padding: 12,
                borderRadius: 8,
                backgroundColor: PastryColors.chocolate,
              }}
            >
              <ThemedText style={{ color: '#FFF' }}>Yadda saxla</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}