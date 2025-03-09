'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { 
  getNeeds, 
  getDailyNeeds, 
  saveDailyNeeds, 
  deleteDailyNeed, 
  formatDate 
} from '@/utils/needs-api';
import MarketSelector from './MarketSelector';
import NeedsSelector from './NeedsSelector';
import ShareOptions from './ShareOptions';

interface Need {
  id: string;
  name: string;
  price: string;
  unit: string;
  createdAt: number;
}

interface DailyNeed extends Need {
  quantity: string;
  total: string;
  market: string;
}

export default function NeedsStockContent() {
  const [date, setDate] = useState<Date>(new Date());
  const [needs, setNeeds] = useState<Need[]>([]);
  const [dailyNeeds, setDailyNeeds] = useState<DailyNeed[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNeedSelector, setShowNeedSelector] = useState(false);
  const [showMarketSelector, setShowMarketSelector] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState('');
  const [markets] = useState(['Altınoğulları', 'Araz Market', 'Digər']);
  const [whatsappReport, setWhatsappReport] = useState('');
  const [pdfReport, setPdfReport] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [needsToSelect, setNeedsToSelect] = useState<Need[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [focusedInputId, setFocusedInputId] = useState<string | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const inputRefs = useRef<{[key: string]: any}>({});

  useEffect(() => {
    fetchNeeds();
    fetchDailyNeeds();
  }, [date]);

  // Klavye olaylarını dinle
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Input'a kaydırma fonksiyonu
  const scrollToInput = (inputId: string) => {
    // Daha uzun bir gecikme ekle
    setTimeout(() => {
      try {
        const index = dailyNeeds.findIndex(n => n.id === inputId);
        if (index >= 0) {
          // Hangi market içinde olduğunu bul
          const market = dailyNeeds[index].market;
          const marketIndex = Object.keys(needsByMarket).indexOf(market);
          
          // Daha doğru bir kaydırma hesaplaması
          const marketHeaderHeight = 50; // Market başlığı yüksekliği
          const itemHeight = 180; // Her öğe yüksekliği (daha yüksek değer)
          const marketOffset = marketIndex * marketHeaderHeight;
          
          // Bu marketten önceki öğelerin toplam yüksekliği
          let previousItemsHeight = 0;
          Object.entries(needsByMarket).forEach(([mkt, items], idx) => {
            if (idx < marketIndex) {
              previousItemsHeight += items.length * itemHeight + marketHeaderHeight;
            }
          });
          
          // Bu market içindeki öğenin konumu
          const marketItems = needsByMarket[market];
          const itemIndexInMarket = marketItems.findIndex(n => n.id === inputId);
          
          // Toplam kaydırma mesafesi
          const yOffset = previousItemsHeight + (itemIndexInMarket * itemHeight) + marketHeaderHeight;
          
          console.log(`Kaydırma: market=${market}, itemIndex=${itemIndexInMarket}, yOffset=${yOffset}`);
          
          // Kaydır ve ekstra boşluk bırak
          scrollViewRef.current?.scrollTo({ 
            y: Math.max(0, yOffset - 80), // Üstte daha fazla boşluk bırak
            animated: true 
          });
        }
      } catch (error) {
        console.error('Kaydırma hatası:', error);
      }
    }, 300); // Daha uzun gecikme
  };

  const fetchNeeds = async () => {
    try {
      setIsLoading(true);
      console.log('Ərzaqlar yüklənir...');
      const needsData = await getNeeds();
      
      // Veri kontrolü yap
      if (Array.isArray(needsData) && needsData.length > 0) {
        console.log(`${needsData.length} adet ərzaq yükləndi:`, needsData.map(n => n.name).slice(0, 5).join(', ') + '...');
        setNeeds(needsData);
      } else {
        console.warn('Ərzaq məlumatları boş veya dizi değil:', needsData);
        setNeeds([]);
        Toast.show({
          type: 'info',
          text1: 'Ərzaq məlumatları tapılmadı',
          text2: 'Zəhmət olmasa əvvəlcə ərzaq əlavə edin',
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('Ərzaqlar yüklənərkən xəta:', error);
      setNeeds([]);
      Toast.show({
        type: 'error',
        text1: 'Ərzaqlar yüklənərkən xəta baş verdi',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyNeeds = async () => {
    try {
      setIsLoading(true);
      const dailyNeedsData = await getDailyNeeds(date);
      
      // Günlük ihtiyaçları DailyNeed formatına dönüştür
      const formattedDailyNeeds: DailyNeed[] = dailyNeedsData.map(need => ({
        id: generateUniqueId(need.name, need.market),
        name: need.name,
        price: need.price,
        unit: need.unit,
        quantity: need.quantity,
        total: need.totalPrice,
        market: need.market,
        createdAt: Date.now()
      }));

      setDailyNeeds(formattedDailyNeeds);
    } catch (error) {
      console.error('Günlük ərzaqlar yüklənərkən xəta:', error);
      Toast.show({
        type: 'error',
        text1: 'Günlük ərzaqlar yüklənərkən xəta baş verdi',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddButtonClick = () => {
    setSelectedMarket('');
    setShowMarketSelector(true);
  };

  const handleMarketSelect = (market: string) => {
    console.log(`Market seçildi: ${market}`);
    setSelectedMarket(market);
    setShowMarketSelector(false);
    
    // Ərzaq seçicisini açmadan önce ərzaqların yüklü olduğundan emin ol
    if (needs.length === 0) {
      console.log('Ərzaqlar boş, yeniden yükleniyor...');
      // Ərzaqları yeniden yükle
      fetchNeeds().then(() => {
        console.log('Ərzaqlar yeniden yüklendi, selector açılıyor...');
        setNeedsToSelect([]);
        setShowNeedSelector(true);
      });
    } else {
      console.log(`${needs.length} adet ərzaq var, selector açılıyor...`);
      setNeedsToSelect([]);
      setShowNeedSelector(true);
    }
  };

  const handleSelectNeed = (selectedItems: Need[]) => {
    if (selectedItems.length === 0) {
      setShowNeedSelector(false);
      return;
    }

    const newDailyNeeds = selectedItems.map(need => {
      // Eğer bu ürün ve market kombinasyonu zaten varsa, ekleme
      const existingNeedIndex = dailyNeeds.findIndex(
        dn => dn.name === need.name && dn.market === selectedMarket
      );

      if (existingNeedIndex !== -1) {
        return null; // Bu ürün zaten var, ekleme
      }

      return {
        id: generateUniqueId(need.name, selectedMarket),
        name: need.name,
        price: need.price,
        unit: need.unit,
        quantity: '1',
        total: need.price,
        market: selectedMarket,
        createdAt: Date.now()
      };
    }).filter(Boolean) as DailyNeed[];

    if (newDailyNeeds.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Seçilən ərzaqlar artıq əlavə edilib',
        position: 'bottom',
      });
    } else {
      setDailyNeeds(prev => [...prev, ...newDailyNeeds]);
      Toast.show({
        type: 'success',
        text1: `${newDailyNeeds.length} ərzaq əlavə edildi`,
        position: 'bottom',
      });
    }

    setShowNeedSelector(false);
  };

  const saveNeeds = async (newNeeds: DailyNeed[]) => {
    try {
      setIsLoading(true);
      
      // Veritabanı formatına dönüştür
      const needsToSave = newNeeds.map(need => ({
        name: need.name,
        price: need.price,
        quantity: need.quantity,
        totalPrice: need.total,
        unit: need.unit,
        market: need.market
      }));

      await saveDailyNeeds(date, needsToSave);
      Toast.show({
        type: 'success',
        text1: 'Məlumatlar yadda saxlanıldı',
        position: 'bottom',
      });
      
      // Güncel verileri yeniden yükle
      await fetchDailyNeeds();
    } catch (error) {
      console.error('Məlumatlar yadda saxlanılarkən xəta:', error);
      Toast.show({
        type: 'error',
        text1: 'Məlumatlar yadda saxlanılarkən xəta baş verdi',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNeed = (need: DailyNeed) => {
    const updatedNeeds = dailyNeeds.map(item => {
      if (item.id === need.id) {
        // Sayı girişi için özel kontrol
        const price = formatDecimalInput(need.price);
        const quantity = formatDecimalInput(need.quantity);
        const total = calculateTotal(price || '0', quantity || '0');
        
        return {
          ...need,
          price: price,
          quantity: quantity,
          total
        };
      }
      return item;
    });
    
    setDailyNeeds(updatedNeeds);
  };

  const handleDeleteNeed = async (needId: string) => {
    try {
      const needToDelete = dailyNeeds.find(n => n.id === needId);
      if (!needToDelete) return;
      
      Alert.alert(
        "Ərzaq silinəcək",
        `"${needToDelete.name}" ərzağını silmək istədiyinizə əminsiniz?`,
        [
          {
            text: "İmtina",
            style: "cancel"
          },
          { 
            text: "Sil", 
            style: "destructive",
            onPress: async () => {
              setDailyNeeds(prev => prev.filter(n => n.id !== needId));
              
              // Veritabanından da sil
              await deleteDailyNeed(date, needToDelete.name, needToDelete.market);
              Toast.show({
                type: 'success',
                text1: `"${needToDelete.name}" silindi`,
                position: 'bottom',
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Ərzaq silinərkən xəta:', error);
      Toast.show({
        type: 'error',
        text1: 'Ərzaq silinərkən xəta baş verdi',
        position: 'bottom',
      });
      
      // Hata durumunda güncel verileri yeniden yükle
      await fetchDailyNeeds();
    }
  };

  const handleShare = () => {
    // WhatsApp raporu oluştur
    const whatsappText = generateWhatsAppReport();
    setWhatsappReport(whatsappText);
    
    // PDF raporu oluştur
    const pdfText = generatePDFReport();
    setPdfReport(pdfText);
    
    // Paylaşım modalını aç
    setShowShareOptions(true);
  };

  const calculateTotal = (price: string, quantity: string): string => {
    const priceValue = parseFloat(price.replace(',', '.')) || 0;
    const quantityValue = parseFloat(quantity.replace(',', '.')) || 0;
    const total = priceValue * quantityValue;
    return total.toFixed(2);
  };

  const handleSave = async () => {
    if (dailyNeeds.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Yadda saxlamaq üçün ən azı bir ərzaq əlavə edin',
        position: 'bottom',
      });
      return;
    }
    
    await saveNeeds(dailyNeeds);
  };

  const generateWhatsAppReport = () => {
    // Marketlere göre grupla
    const needsByMarket: Record<string, DailyNeed[]> = {};
    
    dailyNeeds.forEach(need => {
      if (!needsByMarket[need.market]) {
        needsByMarket[need.market] = [];
      }
      needsByMarket[need.market].push(need);
    });
    
    const totalAmount = calculateTotalAmount();
    
    let report = `🍪 *AIDA'S CORNER* 🍪\n`;
    report += `📅 *Tarix:* ${formatDate(date)}\n\n`;
    
    // Her market için ayrı bölüm oluştur
    Object.keys(needsByMarket).forEach(market => {
      const marketNeeds = needsByMarket[market];
      const marketTotal = calculateMarketTotal(market);
      
      report += `🛒 *MARKET: ${market}* 💰\n`;
      report += `---------------------------\n`;
      
      marketNeeds.forEach((need, index) => {
        report += `${index + 1}. *${need.name}* - ${need.quantity} ${need.unit}\n`;
        report += `   • Qiymət: ${need.price} AZN\n`;
        report += `   • Məbləğ: *${need.total} AZN*\n\n`;
      });
      
      report += `*Market cəmi: ${marketTotal} AZN*\n\n`;
    });
    
    report += `\n💫 *ÜMUMI MƏBLƏĞ: ${totalAmount} AZN*`;
    
    return report;
  };

  const generatePDFReport = () => {
    // Marketlere göre grupla
    const needsByMarket: Record<string, DailyNeed[]> = {};
    
    dailyNeeds.forEach(need => {
      if (!needsByMarket[need.market]) {
        needsByMarket[need.market] = [];
      }
      needsByMarket[need.market].push(need);
    });
    
    const totalAmount = calculateTotalAmount();
    
    let report = `AIDA'S CORNER - ƏRZAQ HESABATI\n`;
    report += `=================================\n\n`;
    report += `Tarix: ${formatDate(date)}\n\n`;
    report += `ÜMUMI MƏLUMAT\n`;
    report += `=============\n`;
    report += `Ümumi məbləğ: ${totalAmount} AZN\n`;
    report += `Market sayı: ${Object.keys(needsByMarket).length}\n`;
    report += `Ərzaq sayı: ${dailyNeeds.length}\n\n`;
    
    // Her market için ayrı bölüm oluştur
    Object.keys(needsByMarket).forEach(market => {
      const marketNeeds = needsByMarket[market];
      const marketTotal = calculateMarketTotal(market);
      
      report += `MARKET: ${market}\n`;
      report += `=================\n`;
      report += `Market cəmi: ${marketTotal} AZN\n\n`;
      report += `ƏRZAQLAR:\n`;
      
      marketNeeds.forEach((need, index) => {
        report += `${index + 1}. ${need.name}\n`;
        report += `   Qiymət: ${need.price} AZN\n`;
        report += `   Miqdar: ${need.quantity} ${need.unit}\n`;
        report += `   Məbləğ: ${need.total} AZN\n\n`;
      });
      
      report += `\n`;
    });
    
    report += `\nHesabat tarixi: ${new Date().toLocaleString('az-AZ')}`;
    
    return report;
  };

  const generateUniqueId = (name: string, market: string): string => {
    return `${name}_${market}_${Date.now()}`;
  };

  const calculateMarketTotal = (market: string): string => {
    const total = dailyNeeds
      .filter(need => need.market === market)
      .reduce((sum, need) => sum + parseFloat(need.total.replace(',', '.')), 0);
    return total.toFixed(2);
  };

  const calculateTotalAmount = (): string => {
    const total = dailyNeeds.reduce((sum, need) => sum + parseFloat(need.total.replace(',', '.')), 0);
    return total.toFixed(2);
  };

  const formatDecimalInput = (value: string): string => {
    // Boş değer kontrolü
    if (!value || value === '' || value === '.' || value === ',') {
      return '';
    }
    
    // Virgülü noktaya çevir
    let formattedValue = value.replace(',', '.');
    
    // Sadece sayısal değerleri ve bir adet nokta işaretini kabul et
    formattedValue = formattedValue.replace(/[^\d.]/g, '');
    
    // Birden fazla nokta varsa, sadece ilkini koru
    const parts = formattedValue.split('.');
    if (parts.length > 2) {
      formattedValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Sayısal değer olarak parse et
    const numValue = parseFloat(formattedValue);
    
    // Geçerli bir sayı değilse boş string döndür
    if (isNaN(numValue)) {
      return '';
    }
    
    // Orijinal değeri döndür (sabit formatlama yapma)
    return formattedValue;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Marketlere göre grupla
  const needsByMarket = dailyNeeds.reduce<Record<string, DailyNeed[]>>((acc, need) => {
    if (!acc[need.market]) acc[need.market] = [];
    acc[need.market].push(need);
    return acc;
  }, {});

  const handleCloseNeedSelector = () => {
    setShowNeedSelector(false);
    setNeedsToSelect([]);
    
    // Eğer needs dizisi boşsa, yeniden yüklemeyi dene
    if (needs.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Ərzaq məlumatları yenidən yüklənir',
        position: 'bottom',
      });
      
      // Kısa bir gecikme ile yeniden yükleme yap
      setTimeout(() => {
        fetchNeeds();
      }, 500);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 120 : 120 }
        ]}
        scrollEventThrottle={16}
        keyboardDismissMode="interactive"
        nestedScrollEnabled={true}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <View style={styles.header}>
              <View style={styles.headerButtons}>
                {dailyNeeds.length > 0 && (
                  <>
                    <TouchableOpacity 
                      style={styles.shareButton}
                      onPress={handleShare}
                    >
                      <MaterialIcons name="share" size={22} color="#F59E0B" />
                      <Text style={styles.buttonText}>Paylaş</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.saveButton}
                      onPress={handleSave}
                    >
                      <MaterialIcons name="save" size={22} color="#F59E0B" />
                      <Text style={styles.buttonText}>Yadda saxla</Text>
                    </TouchableOpacity>
                  </>
                )}
                
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={handleAddButtonClick}
                >
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Ərzaq əlavə et</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.dateRow}>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialIcons name="calendar-today" size={18} color="#4B5563" style={styles.dateIcon} />
                <Text style={styles.dateText}>
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>
              
              {dailyNeeds.length > 0 && (
                <Text style={styles.totalAmount}>
                  Ümumi məbləğ: <Text style={styles.totalAmountValue}>{calculateTotalAmount()} AZN</Text>
                </Text>
              )}
            </View>
            
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text style={styles.loadingText}>Yüklənir...</Text>
              </View>
            ) : dailyNeeds.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🍪</Text>
                <Text style={styles.emptyTitle}>Ərzaq tapılmadı</Text>
                <Text style={styles.emptyDescription}>
                  Bu tarixdə heç bir ərzaq əlavə edilməyib
                </Text>
                <TouchableOpacity 
                  style={styles.emptyAddButton}
                  onPress={handleAddButtonClick}
                >
                  <MaterialIcons name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.emptyAddButtonText}>Ərzaq əlavə et</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.needsContainer}>
                {Object.entries(needsByMarket).map(([market, marketNeeds]) => (
                  <View key={market} style={styles.marketSection}>
                    <View style={styles.marketHeader}>
                      <Text style={styles.marketName}>{market}</Text>
                      <Text style={styles.marketTotal}>
                        Cəmi: <Text style={styles.marketTotalValue}>{calculateMarketTotal(market)} AZN</Text>
                      </Text>
                    </View>
                    
                    {marketNeeds.map((need) => (
                      <View key={need.id} style={styles.needItem}>
                        <View style={styles.needInfo}>
                          <Text style={styles.needName}>{need.name}</Text>
                          <Text style={styles.needUnit}>{need.unit}</Text>
                        </View>
                        
                        <View style={styles.needControls}>
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Qiymət (AZN)</Text>
                            <TextInput
                              style={styles.input}
                              value={need.price}
                              onChangeText={(value) => handleUpdateNeed({
                                ...need,
                                price: value
                              })}
                              keyboardType="decimal-pad"
                              returnKeyType="done"
                              blurOnSubmit={true}
                              onSubmitEditing={() => Keyboard.dismiss()}
                              selectTextOnFocus={true}
                              onFocus={() => {
                                setFocusedInputId(need.id);
                                scrollToInput(need.id);
                              }}
                              ref={ref => {
                                if (ref) inputRefs.current[`price_${need.id}`] = ref;
                              }}
                            />
                          </View>
                          
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Miqdar ({need.unit})</Text>
                            <TextInput
                              style={styles.input}
                              value={need.quantity}
                              onChangeText={(value) => handleUpdateNeed({
                                ...need,
                                quantity: value
                              })}
                              keyboardType="decimal-pad"
                              returnKeyType="done"
                              blurOnSubmit={true}
                              onSubmitEditing={() => Keyboard.dismiss()}
                              selectTextOnFocus={true}
                              onFocus={() => {
                                setFocusedInputId(need.id);
                                scrollToInput(need.id);
                              }}
                              ref={ref => {
                                if (ref) inputRefs.current[`quantity_${need.id}`] = ref;
                              }}
                            />
                          </View>
                          
                          <View style={styles.totalGroup}>
                            <Text style={styles.inputLabel}>Məbləğ</Text>
                            <Text style={styles.totalValue}>{need.total} AZN</Text>
                          </View>
                          
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteNeed(need.id)}
                          >
                            <MaterialIcons name="delete" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      
      {/* Market Seçici */}
      <MarketSelector
        isOpen={showMarketSelector}
        onClose={() => setShowMarketSelector(false)}
        onSelectMarket={handleMarketSelect}
        markets={markets}
      />
      
      {/* Ürün Seçici */}
      <NeedsSelector
        isOpen={showNeedSelector}
        onClose={handleCloseNeedSelector}
        needs={needs}
        onSelectNeed={handleSelectNeed}
        initialSelectedNeeds={needsToSelect}
      />
      
      {/* Paylaşım Seçenekleri */}
      <ShareOptions
        isOpen={showShareOptions}
        onClose={() => setShowShareOptions(false)}
        whatsappReport={whatsappReport}
        pdfReport={pdfReport}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  innerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100, // Alt kısımda ekstra boşluk
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Başlık kaldırıldığı için sağa hizalama
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginLeft: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginLeft: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  buttonText: {
    color: '#F59E0B',
    fontWeight: '500',
    fontSize: 13,
    marginLeft: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 14,
  },
  totalAmountValue: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  needsContainer: {
    flex: 1,
  },
  marketSection: {
    marginBottom: 24,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  marketName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  marketTotal: {
    fontSize: 14,
  },
  marketTotalValue: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  needItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  needInfo: {
    marginBottom: 8,
  },
  needName: {
    fontSize: 16,
    fontWeight: '500',
  },
  needUnit: {
    fontSize: 14,
    color: '#6B7280',
  },
  needControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingBottom: 8,
  },
  inputGroup: {
    width: 80,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 10, // Dokunma alanını daha da artırdık
    fontSize: 16,
    minHeight: 44, // Minimum yüksekliği artırdık
    backgroundColor: '#FFFFFF',
  },
  deleteButton: {
    padding: 8,
  },
  totalGroup: {
    width: 80,
    marginBottom: 8,
    backgroundColor: '#FEF3C7',
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F59E0B',
    textAlign: 'center',
    paddingVertical: 4,
  },
}); 