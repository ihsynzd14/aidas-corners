import { Alert, Linking, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Add helper function to format date
function formatDateString(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Updated formatWhatsAppMessage function
export function formatWhatsAppMessage(totals: { [key: string]: number }, totalProducts: number, totalQuantity: number, totalBranches: number) {
  const date = formatDateString(new Date());
  let message = `*Aida's Corner - Gündəlik Sifariş Hesabatı*\n`;
  message += `📅 ${date}\n\n`;
  message += `📦 *Ümumi Məhsullar:* ${totalProducts} növ\n`;
  message += `📊 *Ümumi Miqdar:* ${totalQuantity} ədəd\n`;
  message += `🏪 *Ümumi Şöbə:* ${totalBranches}\n\n`;
  message += `*Məhsullar üzrə bölgü:*\n`;
  
  Object.entries(totals).forEach(([product, quantity]) => {
    message += `• ${product}: ${quantity} ədəd\n`;
  });
  
  return encodeURIComponent(message);
}

export async function shareViaWhatsApp(message: string) {
  const whatsappUrl = `whatsapp://send?text=${message}`;
  const webWhatsappUrl = `https://wa.me/?text=${message}`; // Fallback URL

  try {
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    } else {
      // If WhatsApp app is not installed, try web version or show store link
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
        // For iOS or other platforms
        await Linking.openURL(webWhatsappUrl);
      }
    }
  } catch (error) {
    Alert.alert(
      "Xəta",
      "Məlumatları paylaşarkən xəta baş verdi. Zəhmət olmasa WhatsApp'ın quraşdırıldığını yoxlayın."
    );
  }
}

// Excel ve PDF için genel paylaşım fonksiyonu
export async function shareFile(filePath: string, type: 'excel' | 'pdf') {
  try {
    // Dosyanın var olduğunu kontrol et
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      throw new Error('Dosya bulunamadı');
    }

    // Paylaşım özelliğinin kullanılabilir olup olmadığını kontrol et
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Paylaşım özelliği bu cihazda kullanılamıyor');
    }

    // Dosyayı paylaş
    await Sharing.shareAsync(filePath, {
      mimeType: type === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf',
      dialogTitle: type === 'excel' ? 'Excel Dosyasını Paylaş' : 'PDF Dosyasını Paylaş',
      UTI: type === 'excel' ? 'com.microsoft.excel.xlsx' : 'com.adobe.pdf'
    });

  } catch (error: any) {
    console.error('Paylaşım hatası:', error);
    Alert.alert(
      "Xəta",
      `${type === 'excel' ? 'Excel' : 'PDF'} faylını paylaşarkən xəta baş verdi: ${error.message}`,
      [{ text: "Tamam" }]
    );
  }
}

// Genel metin paylaşımı için
export async function shareText(text: string, title: string = '') {
  try {
    if (Platform.OS === 'android') {
      const intentUrl = `intent:#Intent;action=android.intent.action.SEND;type=text/plain;S.android.intent.extra.TEXT=${encodeURIComponent(text)};S.android.intent.extra.SUBJECT=${encodeURIComponent(title)};end`;
      await Linking.openURL(intentUrl);
    } else {
      // iOS için Share Sheet
      await Linking.openURL(`sms:&body=${encodeURIComponent(text)}`);
    }
  } catch (error) {
    Alert.alert(
      "Xəta",
      "Məlumatları paylaşarkən xəta baş verdi."
    );
  }
}