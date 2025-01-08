import { Alert, Linking, Platform } from 'react-native';

// Add helper function to format date
function formatDateString(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Updated formatWhatsAppMessage function
export function formatWhatsAppMessage(totals: { [key: string]: number }, totalProducts: number, totalQuantity: number) {
  const date = formatDateString(new Date());
  let message = `*Aida's Corner - Gündəlik Sifariş Hesabatı*\n`;
  message += `📅 ${date}\n\n`;
  message += `📦 *Ümumi Məhsullar:* ${totalProducts} növ\n`;
  message += `📊 *Ümumi Miqdar:* ${totalQuantity} ədəd\n\n`;
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