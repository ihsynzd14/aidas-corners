import { useState, useCallback, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import { formatDate, getCache, setCache, fetchOrdersForDateRange } from '@/utils/firebase';
import * as FileSystem from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';
import XLSX from 'xlsx';
import { shareFile, shareViaWhatsApp } from '@/components/stocks/WPShareText';

export interface ProductStats {
  productName: string;
  branchStats: {
    [key: string]: {
      quantity: number;
      dates: { [date: string]: number };
    };
  };
  totalQuantity: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface DailyStats {
  date: string;
  quantity: number;
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
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);

  const dateRangeCacheKey = useMemo(() => {
    return `stats_${formatDate(startDate)}_${formatDate(endDate)}`;
  }, [startDate, endDate]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const cachedData = getCache(dateRangeCacheKey);
      if (cachedData) {
        console.log('Cache\'den veri alındı:', dateRangeCacheKey);
        setProductStats(cachedData);
        setLoading(false);
        return;
      }

      console.log('Veriler Firebase\'den çekiliyor:', {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      });
      
      const ordersData = await fetchOrdersForDateRange(startDate, endDate);
      const stats: { [key: string]: ProductStats } = {};
      
      ordersData.forEach((branchesSnapshot: OrdersSnapshot, date: string) => {
        branchesSnapshot.forEach((branchDoc: BranchSnapshot) => {
          const branchData = branchDoc.data();
          const branchName = branchDoc.id;

          Object.entries(branchData).forEach(([product, quantity]) => {
            const normalizedProduct = product.trim();
            
            if (!stats[normalizedProduct]) {
              stats[normalizedProduct] = {
                productName: normalizedProduct,
                branchStats: {},
                totalQuantity: 0,
                dateRange: {
                  startDate: formatDate(startDate),
                  endDate: formatDate(endDate)
                }
              };
            }

            const numericQuantity = parseFloat(quantity as string);
            
            if (!stats[normalizedProduct].branchStats[branchName]) {
              stats[normalizedProduct].branchStats[branchName] = {
                quantity: 0,
                dates: {}
              };
            }

            stats[normalizedProduct].branchStats[branchName].quantity += numericQuantity;
            stats[normalizedProduct].branchStats[branchName].dates[date] = 
              (stats[normalizedProduct].branchStats[branchName].dates[date] || 0) + numericQuantity;
            stats[normalizedProduct].totalQuantity += numericQuantity;
          });
        });
      });

      const sortedStats = Object.values(stats).sort((a, b) => b.totalQuantity - a.totalQuantity);
      
      setCache(dateRangeCacheKey, sortedStats);
      setProductStats(sortedStats);
      setLoading(false);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
      setLoading(false);
    }
  }, [startDate, endDate, dateRangeCacheKey]);

  const fetchDailyStats = useCallback(async () => {
    if (!selectedProduct || !selectedBranch) return;

    try {
      setLoading(true);
      
      const dailyCacheKey = `daily_${selectedProduct}_${selectedBranch}_${formatDate(startDate)}_${formatDate(endDate)}`;
      const cachedDailyData = getCache(dailyCacheKey);
      
      if (cachedDailyData) {
        setDailyStats(cachedDailyData);
        setLoading(false);
        return;
      }

      const ordersData = await fetchOrdersForDateRange(startDate, endDate);
      const dailyData: DailyStats[] = [];

      ordersData.forEach((snapshot: OrdersSnapshot, date: string) => {
        snapshot.forEach((doc: BranchSnapshot) => {
          if (doc.id === selectedBranch) {
            const data = doc.data();
            const matchingProduct = Object.entries(data).find(([key]) => 
              key.trim() === selectedProduct.trim()
            );
            
            dailyData.push({
              date,
              quantity: matchingProduct ? parseFloat(matchingProduct[1] as string) : 0
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
  }, [startDate, endDate, selectedProduct, selectedBranch]);

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
      
      if (!FileSystem.documentDirectory) {
        throw new Error('Document directory bulunamadı');
      }

      const filePath = `${FileSystem.documentDirectory}${fileName}`;

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

  return {
    loading,
    productStats,
    startDate,
    endDate,
    showStartPicker,
    showEndPicker,
    viewMode,
    selectedProduct,
    selectedBranch,
    dailyStats,
    availableBranches,
    setStartDate,
    setEndDate,
    setShowStartPicker,
    setShowEndPicker,
    setViewMode,
    setSelectedProduct,
    setSelectedBranch,
    setAvailableBranches,
    fetchData,
    fetchDailyStats,
    generateExcel,
    generateWhatsAppText,
    copyToClipboard
  };
}; 