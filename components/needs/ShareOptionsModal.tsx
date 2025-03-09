import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, Share, Clipboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, PastryColors } from '@/constants/Colors';

interface ShareOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  colors: any;
  generateWhatsAppReport: () => string;
  generatePDFReport: () => string;
}

export const ShareOptionsModal: React.FC<ShareOptionsModalProps> = ({
  visible,
  onClose,
  theme,
  colors,
  generateWhatsAppReport,
  generatePDFReport,
}) => {
  const handleShareWhatsApp = async () => {
    try {
      const report = generateWhatsAppReport();
      await Share.share({
        message: report,
        url: undefined,
      });
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      Alert.alert('Xəta', 'WhatsApp-da paylaşarkən xəta baş verdi');
    }
  };

  const handleCopyToClipboard = () => {
    const report = generateWhatsAppReport();
    Clipboard.setString(report);
    Alert.alert('Uğurlu', 'Hesabat kopyalandı');
    onClose();
  };

  const handleDownloadPDF = () => {
    const report = generatePDFReport();
    // PDF yaratma və yükləmə funksiyonallığı əlavə ediləcək
    Alert.alert('Bildiriş', 'PDF yükləmə funksiyası tezliklə əlavə olunacaq');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.modalContainer}>
        <View style={[
          styles.modalContent,
          { 
            backgroundColor: theme === 'dark' ? Colors.dark.background : Colors.light.background,
            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }
        ]}>
          <TouchableOpacity
            style={[styles.shareOption, { borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
            onPress={handleShareWhatsApp}
          >
            <MaterialCommunityIcons name="whatsapp" size={24} color="#25D366" />
            <Text style={[styles.shareOptionText, { color: colors.text }]}>WhatsApp-da paylaş</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareOption, { borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
            onPress={handleCopyToClipboard}
          >
            <MaterialCommunityIcons name="content-copy" size={24} color={theme === 'dark' ? '#FFFFFF' : PastryColors.chocolate} />
            <Text style={[styles.shareOptionText, { color: colors.text }]}>Kopyala</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareOption, { borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
            onPress={handleDownloadPDF}
          >
            <MaterialCommunityIcons name="file-pdf-box" size={24} color="#FF0000" />
            <Text style={[styles.shareOptionText, { color: colors.text }]}>PDF yüklə</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 16,
  },
  shareOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 