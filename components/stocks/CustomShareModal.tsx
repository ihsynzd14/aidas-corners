import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { PastryColors } from '@/constants/Colors';
import { CustomShareTemplate, formatCustomMessage } from '@/services/customShareService';
import * as Clipboard from 'expo-clipboard';

interface CustomShareModalProps {
  visible: boolean;
  onClose: () => void;
  templates: CustomShareTemplate[];
  productsData: { [key: string]: number };
  totalProducts: number;
  totalQuantity: number;
  totalBranches: number;
  isDark: boolean;
}

export const CustomShareModal: React.FC<CustomShareModalProps> = ({
  visible,
  onClose,
  templates,
  productsData,
  totalProducts,
  totalQuantity,
  totalBranches,
  isDark
}) => {
  const handleTemplateSelect = async (template: CustomShareTemplate, shareType: 'copy' | 'whatsapp') => {
    try {
      const message = formatCustomMessage(template.template, productsData, template.products);
      
      if (shareType === 'copy') {
        await Clipboard.setString(message);
        Alert.alert('Uğurlu', 'Məlumatlar kopyalandı');
      } else {
        // WhatsApp sharing - you'll need to implement this based on your existing WhatsApp sharing logic
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
        Alert.alert('WhatsApp', 'WhatsApp paylaşımı üçün hazırdır');
      }
      onClose();
    } catch (error) {
      Alert.alert('Xəta', 'Məlumatları paylaşarkən xəta baş verdi');
    }
  };

  const renderTemplateItem = ({ item }: { item: CustomShareTemplate }) => (
    <View style={{
      marginVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)',
      padding: 16,
    }}>
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
        marginBottom: 8,
      }}>
        {item.name}
      </Text>
      
      <Text style={{
        fontSize: 12,
        color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)',
        marginBottom: 12,
      }}>
        Məhsullar: {item.products.join(', ')}
      </Text>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={() => handleTemplateSelect(item, 'copy')}
          style={{
            flex: 1,
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.07)',
            padding: 10,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Text style={{ 
            fontSize: 16, 
            color: isDark ? PastryColors.vanilla : PastryColors.chocolate 
          }}>
            📋
          </Text>
          <Text style={{
            fontSize: 12,
            fontWeight: '500',
            color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
          }}>
            Kopyala
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTemplateSelect(item, 'whatsapp')}
          style={{
            flex: 1,
            backgroundColor: '#25D366',
            padding: 10,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 16, color: '#FFFFFF' }}>
            💬
          </Text>
          <Text style={{
            fontSize: 12,
            fontWeight: '500',
            color: '#FFFFFF',
          }}>
            WhatsApp
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
          }}>
            Custom Şablonlar
          </Text>
          
          <TouchableOpacity onPress={onClose}>
            <Text style={{ 
              fontSize: 24, 
              color: isDark ? PastryColors.vanilla : PastryColors.chocolate 
            }}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {/* Template List */}
        <FlatList
          data={templates}
          keyExtractor={item => item.id}
          renderItem={renderTemplateItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ 
              alignItems: 'center', 
              justifyContent: 'center', 
              paddingVertical: 40 
            }}>
              <Text style={{
                fontSize: 48,
                color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(74,53,49,0.3)',
              }}>
                📋
              </Text>
              <Text style={{
                fontSize: 16,
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)',
                marginTop: 12,
              }}>
                Hazırda şablon yoxdur
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
};