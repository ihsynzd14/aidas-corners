import React, { useState, useEffect } from 'react';
import { Modal, View, TouchableOpacity, FlatList, Alert, Text } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PastryColors } from '@/constants/Colors';
import { CustomShareTemplate, getAllTemplates, deleteTemplate, createTemplate, updateTemplate } from '@/services/customShareService';
import { TemplateCreationModal } from './TemplateCreationModal';

interface TemplateManagementModalProps {
  visible: boolean;
  onClose: () => void;
  availableProducts: string[];
  isDark: boolean;
}

export const TemplateManagementModal: React.FC<TemplateManagementModalProps> = ({
  visible,
  onClose,
  availableProducts,
  isDark
}) => {
  const [templates, setTemplates] = useState<CustomShareTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomShareTemplate | undefined>();

  useEffect(() => {
    if (visible) {
      loadTemplates();
    }
  }, [visible]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const allTemplates = await getAllTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      Alert.alert('Xəta', 'Şablonlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (template: Omit<CustomShareTemplate, 'id'>) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, template);
      } else {
        await createTemplate(template);
      }
      await loadTemplates();
      setShowCreationModal(false);
      setEditingTemplate(undefined);
    } catch (error) {
      Alert.alert('Xəta', editingTemplate ? 'Şablon yenilənərkən xəta baş verdi' : 'Şablon yaradılarkən xəta baş verdi');
    }
  };

  const handleEditTemplate = (template: CustomShareTemplate) => {
    setEditingTemplate(template);
    setShowCreationModal(true);
  };

  const handleDeleteTemplate = async (template: CustomShareTemplate) => {
    Alert.alert(
      'Şablonu Sil',
      `"${template.name}" şablonunu silmək istədiyinizə əminsiniz?`,
      [
        { text: 'Ləğv et', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTemplate(template.id);
              await loadTemplates();
            } catch (error) {
              Alert.alert('Xəta', 'Şablon silinərkən xəta baş verdi');
            }
          }
        }
      ]
    );
  };

  const renderTemplateItem = ({ item }: { item: CustomShareTemplate }) => (
    <View style={{
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(74,53,49,0.02)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
            marginBottom: 4,
          }}>
            {item.name}
          </Text>
          
          <Text style={{
            fontSize: 12,
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)',
            marginBottom: 8,
          }}>
            {item.products.length} məhsul • {item.isActive ? 'Aktiv' : 'Deaktiv'}
          </Text>
          
          <Text style={{
            fontSize: 11,
            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(74,53,49,0.4)',
            numberOfLines: 2,
          }}>
            {item.template}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => handleEditTemplate(item)}
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)',
              padding: 8,
              borderRadius: 6,
            }}
          >
            <Text style={{ 
              fontSize: 16, 
              color: isDark ? PastryColors.vanilla : PastryColors.chocolate 
            }}>
              ✏️
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleDeleteTemplate(item)}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              padding: 8,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 16, color: '#EF4444' }}>
              🗑️
            </Text>
          </TouchableOpacity>
        </View>
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
          <TouchableOpacity onPress={onClose}>
            <Text style={{ 
              fontSize: 24, 
              color: isDark ? PastryColors.vanilla : PastryColors.chocolate 
            }}>
              ✕
            </Text>
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
          }}>
            Şablon İdarəsi
          </Text>
          
          <TouchableOpacity
            onPress={() => {
              setEditingTemplate(undefined);
              setShowCreationModal(true);
            }}
          >
            <Text style={{ fontSize: 24, color: '#25D366' }}>
              +
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
                Hələ şablon yoxdur
              </Text>
            </View>
          }
        />

        {/* Creation Modal */}
        <TemplateCreationModal
          visible={showCreationModal}
          onClose={() => {
            setShowCreationModal(false);
            setEditingTemplate(undefined);
          }}
          onSave={handleCreateTemplate}
          availableProducts={availableProducts}
          isDark={isDark}
          editingTemplate={editingTemplate}
        />
      </View>
    </Modal>
  );
};