import { useState, useCallback, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import { formatDate, getCache, setCache, fetchOrdersForDateRange, getProductCorrections, buildPriceHistoryMap, getEffectivePrice, parseDateString } from '@/utils/firebase';
import * as FileSystem from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';
import XLSX from 'xlsx';
import { shareFile, shareViaWhatsApp } from '@/components/stocks/WPShareText';

export interface ProductStats {
  productName: string;
  branchStats: {
    [key: string]: {
      quantity: number;
      earnings: number; // Tarixə uyğun qazanc
      dates: { [date: string]: number };
    };
  };
  totalQuantity: number;
  totalEarnings: number; // Tarixə uyğun ümumi qazanc
  price?: number; // Cari qiymət (geriyə uyğunluq üçün)
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface DailyStats {
  date: string;
  productName: string;
  branchName: string;
  quantity: number;
  price?: number; // Həmin tarixdəki effektiv qiymət
}

interface BranchSnapshot {
  id: string;
  data(): { [key: string]: any };
}

interface OrdersSnapshot {
  forEach(callback: (doc: BranchSnapshot) => void): void;
}

export const useProductStatistics = () => {
  const [loading, setLoading] = useState(true);
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'daily'>('summary');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [filteredEarnings, setFilteredEarnings] = useState<number>(0);

  const dateRangeCacheKey = useMemo(() => {
    return `stats_${formatDate(startDate)}_${formatDate(endDate)}`;
  }, [startDate, endDate]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const cachedData = getCache(dateRangeCacheKey);
      if (cachedData) {
        console.log('Cache\'den veri alındı:', dateRangeCacheKey);
        setProductStats(cachedData.productStats);
        setTotalEarnings(cachedData.totalEarnings);
        setLoading(false);
        return;
      }

      console.log('Veriler Firebase\'den çekiliyor:', {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      });

      // Qiymət tarixçəsi xəritəsini al
      const productCorrections = await getProductCorrections();
      const priceHistoryMap = buildPriceHistoryMap(productCorrections);

      // Cari qiymət xəritəsi (geriyə uyğunluq üçün)
      const currentPriceMap = new Map<string, number>();
      productCorrections.forEach(product => {
        if (product.price !== undefined) {
          currentPriceMap.set(product.correct.toLowerCase(), product.price);
          product.variations.forEach(variation => {
            currentPriceMap.set(variation.toLowerCase(), product.price!);
          });
        }
      });

      const ordersData = await fetchOrdersForDateRange(startDate, endDate);
      const stats: { [key: string]: ProductStats } = {};

      ordersData.forEach((branchesSnapshot: OrdersSnapshot, date: string) => {
        // DD.MM.YYYY formatından Date obyektinə çevir
        const orderDate = parseDateString(date);

        branchesSnapshot.forEach((branchDoc: BranchSnapshot) => {
          const branchData = branchDoc.data();
          const branchName = branchDoc.id;

          Object.entries(branchData).forEach(([product, quantity]) => {
            const normalizedProduct = product.trim();
            const normalizedLower = normalizedProduct.toLowerCase();
            
            // Tarixə uyğun effektiv qiyməti tap
            const priceHistory = priceHistoryMap.get(normalizedLower);
            const effectivePrice = priceHistory ? getEffectivePrice(priceHistory, orderDate) : undefined;
            const currentPrice = currentPriceMap.get(normalizedLower);

            if (!stats[normalizedProduct]) {
              stats[normalizedProduct] = {
                productName: normalizedProduct,
                branchStats: {},
                totalQuantity: 0,
                totalEarnings: 0,
                price: currentPrice,
                dateRange: {
                  startDate: formatDate(startDate),
                  endDate: formatDate(endDate)
                }
              };
            }

            const numericQuantity = parseFloat(quantity as string);
            const lineEarnings = effectivePrice !== undefined ? numericQuantity * effectivePrice : 0;
            
            if (!stats[normalizedProduct].branchStats[branchName]) {
              stats[normalizedProduct].branchStats[branchName] = {
                quantity: 0,
                earnings: 0,
                dates: {}
              };
            }

            stats[normalizedProduct].branchStats[branchName].quantity += numericQuantity;
            stats[normalizedProduct].branchStats[branchName].earnings += lineEarnings;
            stats[normalizedProduct].branchStats[branchName].dates[date] = 
              (stats[normalizedProduct].branchStats[branchName].dates[date] || 0) + numericQuantity;
            stats[normalizedProduct].totalQuantity += numericQuantity;
            stats[normalizedProduct].totalEarnings += lineEarnings;
          });
        });
      });

      const sortedStats = Object.values(stats).sort((a, b) => b.totalQuantity - a.totalQuantity);

      // Ümumi qazancı hesabla
      const earnings = sortedStats.reduce((sum, stat) => sum + stat.totalEarnings, 0);

      setCache(dateRangeCacheKey, { productStats: sortedStats, totalEarnings: earnings });
      setProductStats(sortedStats);
      setTotalEarnings(earnings);
      setLoading(false);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
      setLoading(false);
    }
  }, [startDate, endDate, dateRangeCacheKey]);

  const fetchDailyStats = useCallback(async () => {
    if (!selectedBranches?.length) return;

    try {
      setLoading(true);

      const productsToFetch = selectedProducts?.length > 0 ? selectedProducts : productStats.map(p => p.productName);
      const dailyCacheKey = `daily_${productsToFetch.join('_')}_${selectedBranches.join('_')}_${formatDate(startDate)}_${formatDate(endDate)}`;
      const cachedDailyData = getCache(dailyCacheKey);

      if (cachedDailyData) {
        setDailyStats(cachedDailyData);
        setLoading(false);
        return;
      }

      // Qiymət tarixçəsi xəritəsini al
      const productCorrections = await getProductCorrections();
      const priceHistoryMap = buildPriceHistoryMap(productCorrections);

      const ordersData = await fetchOrdersForDateRange(startDate, endDate);
      const dailyData: DailyStats[] = [];

      ordersData.forEach((snapshot: OrdersSnapshot, date: string) => {
        const orderDate = parseDateString(date);

        snapshot.forEach((doc: BranchSnapshot) => {
          if (selectedBranches.includes(doc.id)) {
            const data = doc.data();

            productsToFetch.forEach(product => {
              const matchingProduct = Object.entries(data).find(([key]) =>
                key.trim() === product.trim()
              );

              if (matchingProduct) {
                const quantity = parseFloat(matchingProduct[1] as string);
                // Tarixə uyğun qiyməti tap
                const priceHistory = priceHistoryMap.get(product.trim().toLowerCase());
                const effectivePrice = priceHistory ? getEffectivePrice(priceHistory, orderDate) : undefined;

                dailyData.push({
                  date,
                  productName: product,
                  branchName: doc.id,
                  quantity,
                  price: effectivePrice
                });
              }
            });
          }
        });
      });

      setCache(dailyCacheKey, dailyData);
      setDailyStats(dailyData);
      setLoading(false);
    } catch (error) {
      console.error('Daily stats çekme hatası:', error);
      setLoading(false);
    }
  }, [startDate, endDate, selectedProducts, selectedBranches, productStats]);

  const generateDetailedText = () => {
    const date = new Date();
    const timeStr = date.toLocaleTimeString('az-AZ', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    let message = `🏪 *Aida's Corner - Məhsul Statistikası*\n`;
    message += `📅 Tarix: ${formatDate(date)} ${timeStr}\n`;
    message += `📊 Hesabat dövrü: ${formatDate(startDate)} - ${formatDate(endDate)}\n\n`;
    
    message += `📌 *Ümumi Məlumat:*\n`;
    message += `• Məhsul növü: ${productStats.length}\n`;
    const totalQuantity = productStats.reduce((sum, stat) => sum + stat.totalQuantity, 0);
    message += `• Ümumi miqdar: ${totalQuantity} ədəd\n`;
    const uniqueBranches = new Set(
      productStats.flatMap(stat => Object.keys(stat.branchStats))
    );
    message += `• Aktiv şöbə: ${uniqueBranches.size}\n\n`;

    message += `🔍 *Məhsullar üzrə detallı bölgü:*\n\n`;
    
    productStats.forEach((stat, index) => {
      message += `${index + 1}. *${stat.productName}*\n`;
      message += `   📦 Ümumi: ${stat.totalQuantity} ədəd\n`;
      
      const sortedBranches = Object.entries(stat.branchStats)
        .sort(([, a], [, b]) => b.quantity - a.quantity);
      
      sortedBranches.forEach(([branch, data]) => {
        const percentage = ((data.quantity / stat.totalQuantity) * 100).toFixed(1);
        message += `   • ${branch}: ${data.quantity} (${percentage} faiz)\n`;
      });
      message += '\n';
    });

    message += `\n📝 Hesabat Aida's Corner tərəfindən yaradılıb`;
    
    return message;
  };

  const generateExcel = async () => {
    try {
      console.log('Excel oluşturma başladı');
      const wb = XLSX.utils.book_new();
      
      // Özet sayfası için veri hazırlama
      const totalQuantity = productStats.reduce((sum, stat) => sum + stat.totalQuantity, 0);
      const summaryData = productStats.map(stat => {
        return {
          'Məhsul Adı': stat.productName,
          'Ümumi Miqdar': stat.totalQuantity,
          'Ümumi Faiz': `${((stat.totalQuantity / totalQuantity) * 100).toFixed(1)}%`,
        };
      });

      // Özet sayfasını ekle
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      
      // Sütun genişliklerini ayarla
      const summaryColumnWidths = [
        { wch: 30 }, // Məhsul Adı
        { wch: 15 }, // Ümumi Miqdar
        { wch: 15 }, // Ümumi Faiz
      ];
      summaryWs['!cols'] = summaryColumnWidths;
      
      XLSX.utils.book_append_sheet(wb, summaryWs, "Ümumi Hesabat");

      // Tüm şubeleri topla
      const allBranches = new Set<string>();
      productStats.forEach(stat => {
        Object.keys(stat.branchStats).forEach(branch => allBranches.add(branch));
      });

      // Her şube için ayrı sayfa oluştur
      allBranches.forEach(branch => {
        const branchData = productStats.map(stat => {
          const branchStat = stat.branchStats[branch] || { quantity: 0 };
          const branchPercentage = ((branchStat.quantity / stat.totalQuantity) * 100).toFixed(1);
          const totalPercentage = ((stat.totalQuantity / totalQuantity) * 100).toFixed(1);
          
          return {
            'Məhsul': stat.productName,
            'Şöbə Miqdarı': branchStat.quantity,
            'Ümumi Miqdar': stat.totalQuantity,
            'Şöbə Faizi': `${branchPercentage}%`,
            'Ümumi Faiz': `${totalPercentage}%`,
          };
        }).filter(item => item['Şöbə Miqdarı'] > 0);

        if (branchData.length > 0) {
          const branchWs = XLSX.utils.json_to_sheet(branchData);
          
          const columnWidths = [
            { wch: 30 }, // Məhsul
            { wch: 15 }, // Şöbə Miqdarı
            { wch: 15 }, // Ümumi Miqdar
            { wch: 12 }, // Şöbə Faizi
            { wch: 12 }, // Ümumi Faiz
          ];
          branchWs['!cols'] = columnWidths;

          XLSX.utils.book_append_sheet(wb, branchWs, branch);
        }
      });

      // Detaylı özet sayfası oluştur
      const detailedSummaryData = productStats.map(stat => {
        const row: any = {
          'Məhsul': stat.productName,
          'Ümumi Miqdar': stat.totalQuantity,
        };

        allBranches.forEach(branch => {
          const branchStat = stat.branchStats[branch] || { quantity: 0 };
          row[`${branch} (Miqdar)`] = branchStat.quantity;
          row[`${branch} (%)`] = `${((branchStat.quantity / stat.totalQuantity) * 100).toFixed(1)}%`;
        });

        return row;
      });

      const detailedSummaryWs = XLSX.utils.json_to_sheet(detailedSummaryData);
      XLSX.utils.book_append_sheet(wb, detailedSummaryWs, "Detallı Hesabat");

      const fileName = `aidas_corner_hesabat_${formatDate(startDate)}_${formatDate(endDate)}.xlsx`;
      
      const documentDirectory = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      
      if (!documentDirectory) {
        throw new Error('Fayl sistemi mövcud deyil. Zəhmət olmasa standalone versiyada cəhd edin.');
      }

      const filePath = `${documentDirectory}${fileName}`;

      const wbout = XLSX.write(wb, { 
        type: 'base64', 
        bookType: 'xlsx',
        bookSST: false,
        compression: true
      });

      await FileSystem.writeAsStringAsync(filePath, wbout, {
        encoding: FileSystem.EncodingType.Base64
      });

      const newFileInfo = await FileSystem.getInfoAsync(filePath);
      if (!newFileInfo.exists) {
        throw new Error('Dosya oluşturulamadı');
      }

      Alert.alert(
        "Excel Faylı Hazırdır",
        "Excel faylı ilə nə etmək istəyirsiniz?",
        [
          {
            text: "Cihaza Yüklə",
            onPress: async () => {
              try {
                if (Platform.OS === 'android') {
                  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                  if (permissions.granted) {
                    const base64Data = await FileSystem.readAsStringAsync(filePath, {
                      encoding: FileSystem.EncodingType.Base64
                    });
                    
                    const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(
                      permissions.directoryUri,
                      fileName,
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    );
                    
                    await FileSystem.writeAsStringAsync(destinationUri, base64Data, {
                      encoding: FileSystem.EncodingType.Base64
                    });
                    
                    Alert.alert("Uğurlu", "Excel faylı cihaza yükləndi");
                  }
                } else {
                  await shareFile(filePath, 'excel');
                  Alert.alert("Uğurlu", "Excel faylı cihaza yükləndi");
                }
              } catch (error: any) {
                console.error('Kaydetme hatası:', error);
                Alert.alert("Xəta", "Fayl yüklənərkən xəta baş verdi: " + error.message);
              }
            }
          },
          {
            text: "Paylaş",
            onPress: async () => {
              try {
                await shareFile(filePath, 'excel');
              } catch (error: any) {
                console.error('Paylaşım hatası:', error);
                Alert.alert("Xəta", "Fayl paylaşılarkən xəta baş verdi: " + error.message);
              }
            }
          },
          {
            text: "İmtina",
            style: "cancel"
          }
        ]
      );

    } catch (error: any) {
      console.error('Excel yaradılma xətası:', error);
      Alert.alert(
        "Xəta",
        `Excel faylı yaradılarkən xəta baş verdi: ${error.message}`,
        [{ text: "Tamam" }]
      );
    }
  };

  const generateWhatsAppText = () => {
    const text = generateDetailedText();
    shareViaWhatsApp(text);
  };

  const copyToClipboard = async () => {
    const text = generateDetailedText();
    await Clipboard.setStringAsync(text);
  };

  const onDateRangeConfirm = useCallback((start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  useMemo(() => {
    if (selectedProducts?.length > 0 && selectedBranches?.length > 0) {
      let earnings = 0;
      selectedProducts.forEach(productName => {
        const product = productStats.find(p => p.productName === productName);
        if (product) {
          selectedBranches.forEach(branchName => {
            const branchEarnings = product.branchStats[branchName]?.earnings || 0;
            earnings += branchEarnings;
          });
        }
      });
      setFilteredEarnings(earnings);
    } else {
      setFilteredEarnings(0);
    }
  }, [selectedProducts, selectedBranches, productStats]);

  return {
    loading,
    productStats,
    startDate,
    endDate,
    showStartPicker,
    showEndPicker,
    viewMode,
    selectedProducts,
    selectedBranches,
    dailyStats,
    availableBranches,
    totalEarnings,
    filteredEarnings,
    setStartDate,
    setEndDate,
    setShowStartPicker,
    setShowEndPicker,
    setViewMode,
    setSelectedProducts,
    setSelectedBranches,
    setAvailableBranches,
    fetchData,
    fetchDailyStats,
    generateExcel,
    generateWhatsAppText,
    copyToClipboard,
    onDateRangeConfirm
  };
};