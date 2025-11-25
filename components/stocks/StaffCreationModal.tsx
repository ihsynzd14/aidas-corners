import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { PastryColors } from '@/constants/Colors';

interface StaffCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (staffGroup: { name: string; members: string[] }) => Promise<void>;
  isDark: boolean;
}

export const StaffCreationModal: React.FC<StaffCreationModalProps> = ({
  visible,
  onClose,
  onSave,
  isDark
}) => {
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  const addMemberField = () => {
    setMembers([...members, '']);
  };

  const updateMember = (index: number, value: string) => {
    const updatedMembers = [...members];
    updatedMembers[index] = value;
    setMembers(updatedMembers);
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      const updatedMembers = members.filter((_, i) => i !== index);
      setMembers(updatedMembers);
    }
  };

  const handleSave = async () => {
    if (!groupName.trim()) {
      Alert.alert('Xəta', 'Qrup adı daxil edin');
      return;
    }

    const validMembers = members.filter(member => member.trim().length > 0);
    if (validMembers.length === 0) {
      Alert.alert('Xəta', 'Ən azı bir işçi daxil edin');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        name: groupName.trim(),
        members: validMembers
      });
      onClose();
      // Reset form
      setGroupName('');
      setMembers(['']);
    } catch (error) {
      Alert.alert('Xəta', 'İşçi qrupu saxlanarkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

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
            Yeni İşçi Qrupu
          </Text>
          
          <TouchableOpacity 
            onPress={handleSave}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.5 : 1 }}
          >
            <Text style={{ 
              fontSize: 24, 
              color: isLoading ? 'rgba(255,255,255,0.3)' : '#25D366' 
            }}>
              ✓
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          {/* Group Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
              marginBottom: 8,
            }}>
              Qrup Adı
            </Text>
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Məs: Cheesecake Staff"
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(74,53,49,0.4)'}
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.05)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
              }}
            />
          </View>

          {/* Members */}
          <View style={{ marginBottom: 20 }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
              }}>
                İşçilər
              </Text>
              <TouchableOpacity
                onPress={addMemberField}
                style={{
                  backgroundColor: '#25D366',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#FFFFFF',
                }}>
                  + Əlavə et
                </Text>
              </TouchableOpacity>
            </View>

            {members.map((member, index) => (
              <View key={index} style={{ marginBottom: 12 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <TextInput
                    value={member}
                    onChangeText={(value) => updateMember(index, value)}
                    placeholder={`İşçi ${index + 1}`}
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(74,53,49,0.4)'}
                    style={{
                      flex: 1,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.05)',
                      borderWidth: 1,
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
                    }}
                  />
                  {members.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeMember(index)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 18, color: '#EF4444' }}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.05)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
          }}>
            <Text style={{
              fontSize: 12,
              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)',
              lineHeight: 18,
            }}>
              💡 İpucu: İşçi qrupları yaratdıqdan sonra "Şablonları İdarə Et" bölməsində bu qruplar üçün şablonlar yarada bilərsiniz.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};