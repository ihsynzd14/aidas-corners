import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Linking, LayoutAnimation } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Colors, PastryColors } from '@/constants/Colors';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

interface ShareOptionsGroupProps {
  theme: 'light' | 'dark';
  colors: any;
  generateWhatsAppReport: () => string;
  generatePDFReport: () => string;
}

export const ShareOptionsGroup: React.FC<ShareOptionsGroupProps> = ({
  theme,
  colors,
  generateWhatsAppReport,
  generatePDFReport,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleShareWhatsApp = async () => {
    try {
      const report = generateWhatsAppReport();
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(report)}`;
      const webWhatsappUrl = `https://wa.me/?text=${encodeURIComponent(report)}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        if (Platform.OS === 'android') {
          const playStoreUrl = 'market://details?id=com.whatsapp';
          Alert.alert(
            "WhatsApp tapılmadı",
            "Məlumatları paylaşmaq üçün WhatsApp yükləməlisiniz",
            [
              {
                text: "Play Store'a keç",
                onPress: () => Linking.openURL(playStoreUrl)
              },
              {
                text: "Web versiyaya keç",
                onPress: () => Linking.openURL(webWhatsappUrl)
              },
              {
                text: "İmtina",
                style: "cancel"
              }
            ]
          );
        } else {
          await Linking.openURL(webWhatsappUrl);
        }
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      Alert.alert('Xəta', 'WhatsApp-da paylaşarkən xəta baş verdi');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const report = generateWhatsAppReport();
      await Clipboard.setStringAsync(report);
      Alert.alert('Uğurlu', 'Hesabat kopyalandı');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Xəta', 'Mətn kopyalanarkən xəta baş verdi');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const report = generatePDFReport();
      const fileName = `aidas_corner_hesabat_${new Date().toISOString().split('T')[0]}.txt`;
      
      if (!FileSystem.documentDirectory) {
        throw new Error('Document directory bulunamadı');
      }

      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, report);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Paylaşım özelliği bu cihazda kullanılamıyor');
      }

      await Sharing.shareAsync(filePath, {
        mimeType: 'text/plain',
        dialogTitle: 'Hesabatı Paylaş'
      });
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Xəta', `Hesabat yüklənərkən xəta baş verdi: ${error.message}`);
    }
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const bgColor = theme === 'dark' ? Colors.dark.background : Colors.light.background;
  const borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const textColor = theme === 'dark' ? '#E5E7EB' : '#374151';
  const secondaryTextColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';

  return (
    <View style={[styles.container, { borderColor, backgroundColor: bgColor }]}>
      <TouchableOpacity 
        style={styles.headerSection} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <MaterialIcons 
            name="ios-share" 
            size={22} 
            color={textColor}
            style={styles.shareIcon}
          />
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Hesabatı Paylaş
          </Text>
        </View>
        
        <MaterialIcons 
          name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
          size={24} 
          color={secondaryTextColor}
          style={styles.arrowIcon}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={[styles.buttonGroup, { borderTopColor: borderColor }]}>
          <TouchableOpacity 
            style={[styles.shareButton, styles.whatsappButton]} 
            onPress={handleShareWhatsApp}
          >
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="whatsapp" size={20} color="#FFFFFF" />
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>WhatsApp</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.shareButton, 
              styles.outlineButton,
              { backgroundColor: bgColor, borderColor }
            ]} 
            onPress={handleCopyToClipboard}
          >
            <View style={styles.buttonContent}>
              <MaterialIcons name="content-copy" size={20} color={textColor} />
              <Text style={[styles.buttonText, { color: textColor }]}>Kopyala</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.shareButton, 
              styles.outlineButton,
              { backgroundColor: bgColor, borderColor }
            ]} 
            onPress={handleDownloadPDF}
          >
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="file-pdf-box" size={20} color="#FF0000" />
              <Text style={[styles.buttonText, { color: textColor }]}>PDF</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareIcon: {
    marginRight: 8,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    padding: 14,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  shareButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  outlineButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ShareOptionsGroup; 