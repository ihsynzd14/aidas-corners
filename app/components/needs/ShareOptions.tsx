'use client';

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Share,
  Linking,
  Platform,
  Clipboard
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

interface ShareOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappReport: string;
  pdfReport: string;
}

export default function ShareOptions({ 
  isOpen, 
  onClose, 
  whatsappReport, 
  pdfReport 
}: ShareOptionsProps) {
  const [activeTab, setActiveTab] = useState('whatsapp');

  const handleCopyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Toast.show({
      type: 'success',
      text1: 'Mətn kopyalandı',
      position: 'bottom',
    });
  };

  const handleShareWhatsApp = async () => {
    try {
      const encodedText = encodeURIComponent(whatsappReport);
      const whatsappUrl = `whatsapp://send?text=${encodedText}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        // WhatsApp yüklü değilse genel paylaşım kullan
        await Share.share({
          message: whatsappReport,
        });
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      Toast.show({
        type: 'error',
        text1: 'Paylaşım sırasında bir hata oluştu',
        position: 'bottom',
      });
    }
  };

  const handleShareText = async (text: string) => {
    try {
      await Share.share({
        message: text,
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      Toast.show({
        type: 'error',
        text1: 'Paylaşım sırasında bir hata oluştu',
        position: 'bottom',
      });
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Hesabatı paylaş</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[
                styles.tabButton, 
                activeTab === 'whatsapp' && styles.activeTabButton
              ]}
              onPress={() => setActiveTab('whatsapp')}
            >
              <Text style={[
                styles.tabButtonText,
                activeTab === 'whatsapp' && styles.activeTabButtonText
              ]}>
                WhatsApp
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tabButton, 
                activeTab === 'text' && styles.activeTabButton
              ]}
              onPress={() => setActiveTab('text')}
            >
              <Text style={[
                styles.tabButtonText,
                activeTab === 'text' && styles.activeTabButtonText
              ]}>
                Mətn
              </Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'whatsapp' ? (
            <View style={styles.tabContent}>
              <ScrollView style={styles.reportContainer}>
                <Text style={styles.reportText}>{whatsappReport}</Text>
              </ScrollView>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => handleCopyToClipboard(whatsappReport)}
                >
                  <MaterialIcons name="content-copy" size={20} color="#4B5563" />
                  <Text style={styles.buttonText}>Kopyala</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.whatsappButton}
                  onPress={handleShareWhatsApp}
                >
                  <MaterialIcons name="share" size={20} color="#FFFFFF" />
                  <Text style={styles.whatsappButtonText}>WhatsApp ilə paylaş</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.helpText}>
                Hesabatı kopyalayıb WhatsApp və ya digər mesajlaşma proqramlarında paylaşa bilərsiniz.
              </Text>
            </View>
          ) : (
            <View style={styles.tabContent}>
              <ScrollView style={styles.reportContainer}>
                <Text style={styles.reportText}>{pdfReport}</Text>
              </ScrollView>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => handleCopyToClipboard(pdfReport)}
                >
                  <MaterialIcons name="content-copy" size={20} color="#4B5563" />
                  <Text style={styles.buttonText}>Kopyala</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={() => handleShareText(pdfReport)}
                >
                  <MaterialIcons name="share" size={20} color="#FFFFFF" />
                  <Text style={styles.shareButtonText}>Paylaş</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.helpText}>
                Hesabatı mətn formatında paylaşa bilərsiniz. PDF formatı mobil cihazlarda dəstəklənmir.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 2,
    borderBottomColor: '#F59E0B',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  activeTabButtonText: {
    fontWeight: '600',
    color: '#000000',
  },
  tabContent: {
    padding: 16,
  },
  reportContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    maxHeight: 300,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reportText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  whatsappButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366', // WhatsApp green
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  whatsappButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  shareButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6', // blue-500
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
}); 