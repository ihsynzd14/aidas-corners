import * as Notifications from 'expo-notifications';
import { formatDate, fetchOrdersForDateRange } from '@/utils/firebase';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { Platform } from 'react-native';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationHistoryItem } from '@/components/ai-assistant/core/types';
import Constants from 'expo-constants';

interface NotificationData {
  title: string;
  body: string;
  type: 'comparison' | 'topSelling' | 'insight';
}

interface NotificationTime {
  hour: number;
  minute: number;
  type: 'comparison' | 'topSelling' | 'insight';
}

const NOTIFICATION_HISTORY_KEY = '@notification_history';
const NOTIFICATION_TIMES_KEY = '@notification_times';

const DEFAULT_NOTIFICATION_TIMES: NotificationTime[] = [
  { hour: 18, minute: 0, type: 'insight' },
  { hour: 16, minute: 0, type: 'topSelling' },
  { hour: 20, minute: 0, type: 'comparison' }
];

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {
    this.setupNotifications();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async setupNotifications() {
    try {
      const isExpoGo = Constants.appOwnership === 'expo';
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Bildiriş icazəsi alınmadı!');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (isExpoGo) {
        console.log('✅ Local bildirimlər hazırdır (Expo Go)');
      }

      await this.scheduleNotifications();
    } catch (error) {
      console.log('Bildirim kurulumu sırasında hata (normal for Expo Go):', error);
    }
  }

  public async getNotificationTimes(): Promise<NotificationTime[]> {
    try {
      const times = await AsyncStorage.getItem(NOTIFICATION_TIMES_KEY);
      return times ? JSON.parse(times) : DEFAULT_NOTIFICATION_TIMES;
    } catch (error) {
      console.error('Bildiriş zamanları alınarkən xəta:', error);
      return DEFAULT_NOTIFICATION_TIMES;
    }
  }

  public async setNotificationTime(type: 'comparison' | 'topSelling' | 'insight', hour: number, minute: number): Promise<void> {
    try {
      const times = await this.getNotificationTimes();
      const updatedTimes = times.map(t => 
        t.type === type ? { ...t, hour, minute } : t
      );
      await AsyncStorage.setItem(NOTIFICATION_TIMES_KEY, JSON.stringify(updatedTimes));
      await this.scheduleNotifications();
    } catch (error) {
      console.error('Bildiriş zamanı yenilənərkən xəta:', error);
      throw error;
    }
  }

  private async scheduleNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const notificationTimes = await this.getNotificationTimes();

      for (const { hour, minute, type } of notificationTimes) {
        const now = new Date();
        const nextTriggerDate = new Date(now);
        nextTriggerDate.setHours(hour, minute, 0, 0);
        
        if (nextTriggerDate <= now) {
          nextTriggerDate.setDate(nextTriggerDate.getDate() + 1);
        }

        let notificationData = await this.prepareNotificationData(type);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: notificationData.title,
            body: notificationData.body,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { type }
          },
          trigger: {
            hour: hour,
            minute: minute,
            type: SchedulableTriggerInputTypes.DAILY
          }
        });
      }
      
      console.log('✅ Local bildirimlər planlandı');
    } catch (error) {
      console.log('Bildirim zamanlama hatası:', error);
    }
  }

  private async prepareNotificationData(type: 'comparison' | 'topSelling' | 'insight'): Promise<NotificationData> {
    let data: NotificationData;

    switch (type) {
      case 'comparison':
        data = {
          title: "Həftəlik Müqayisə",
          body: await this.calculateWeeklyComparison(),
          type
        };
        break;
      case 'topSelling':
        data = {
          title: "Ən Çox Satılanlar",
          body: await this.getTopSellingProducts(),
          type
        };
        break;
      case 'insight':
        data = {
          title: "Gündəlik Analiz",
          body: await this.getDailyInsight(),
          type
        };
        break;
    }

    await this.saveToHistory(data);
    return data;
  }

  private async saveToHistory(data: NotificationData) {
    try {
      const historyItem: NotificationHistoryItem = {
        id: Date.now().toString(),
        ...data,
        timestamp: Date.now()
      };

      const existingHistory = await this.getNotificationHistory();
      const updatedHistory = [historyItem, ...existingHistory].slice(0, 50); // Son 50 bildirimi sakla

      await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Bildiriş tarixçəsi saxlanılarkən xəta:', error);
    }
  }

  public async getNotificationHistory(): Promise<NotificationHistoryItem[]> {
    try {
      const history = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Bildiriş tarixçəsi alınarkən xəta:', error);
      return [];
    }
  }

  public async deleteNotification(id: string): Promise<void> {
    try {
      const history = await this.getNotificationHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Bildiriş silinərkən xəta:', error);
      throw error;
    }
  }

  public async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify([]));
    } catch (error) {
      console.error('Bildirişlər təmizlənərkən xəta:', error);
      throw error;
    }
  }

  private async calculateWeeklyComparison(): Promise<string> {
    const today = new Date();
    const lastWeekStart = new Date(today);
    const thisWeekStart = new Date(today);
    
    lastWeekStart.setDate(today.getDate() - 14);
    thisWeekStart.setDate(today.getDate() - 7);
    
    const thisWeekOrders = await fetchOrdersForDateRange(thisWeekStart, today);
    const lastWeekOrders = await fetchOrdersForDateRange(lastWeekStart, thisWeekStart);

    let thisWeekTotal = 0;
    let lastWeekTotal = 0;

    // Bu haftanın toplamını hesapla
    thisWeekOrders.forEach((snapshot, date) => {
      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        Object.values(data).forEach(quantity => {
          thisWeekTotal += parseInt(quantity as string) || 0;
        });
      });
    });

    // Geçen haftanın toplamını hesapla
    lastWeekOrders.forEach((snapshot, date) => {
      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        Object.values(data).forEach(quantity => {
          lastWeekTotal += parseInt(quantity as string) || 0;
        });
      });
    });

    const difference = thisWeekTotal - lastWeekTotal;
    const percentageChange = (difference / lastWeekTotal) * 100;

    const trendEmoji = difference > 0 ? '📈' : '📉';
    const trendText = difference > 0 ? 'artış' : 'düşüş';
    return `${trendEmoji} Geçən həftəyə görə %${percentageChange.toFixed(2)} ${trendText} oldu!\n` +
           `Bu həftə toplam: 📦${thisWeekTotal} sipariş\n` +
           `Geçen həftə toplam: 📦${lastWeekTotal} sipariş`;
  }

  private async getTopSellingProducts(): Promise<string> {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    
    const weeklyOrders = await fetchOrdersForDateRange(weekStart, today);
    const productTotals = new Map<string, number>();

    // Tüm ürünlerin satış toplamlarını hesapla
    weeklyOrders.forEach((snapshot, date) => {
      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        Object.entries(data).forEach(([product, quantity]) => {
          const currentTotal = productTotals.get(product) || 0;
          productTotals.set(product, currentTotal + (parseInt(quantity as string) || 0));
        });
      });
    });

    // En çok satan 3 ürünü bul
    const sortedProducts = Array.from(productTotals.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return `Bu həftənin ən çox satılan məhsulları: \n🏅 1ci: ${sortedProducts[0]?.[0] || 'N/A'} (${sortedProducts[0]?.[1] || 0} ədəd), \n🥈 2ci: ${sortedProducts[1]?.[0] || 'N/A'} (${sortedProducts[1]?.[1] || 0} ədəd), \n🥉 3cü: ${sortedProducts[2]?.[0] || 'N/A'} (${sortedProducts[2]?.[1] || 0} ədəd)`;
  }

  private async getDailyInsight(): Promise<string> {
    const today = new Date();
    const todayFormatted = formatDate(today);
    const todayOrders = await fetchOrdersForDateRange(today, today);
    
    const branchPerformance = new Map<string, number>();
    let totalOrders = 0;

    // Şubelerin performansını hesapla
    todayOrders.forEach((snapshot, date) => {
      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        const branchName = doc.id;
        const data = doc.data();
        let branchTotal = 0;

        Object.values(data).forEach(quantity => {
          const quantityNum = parseInt(quantity as string) || 0;
          branchTotal += quantityNum;
          totalOrders += quantityNum;
        });

        branchPerformance.set(branchName, branchTotal);
      });
    });

    // En iyi performans gösteren şubeyi bul
    const topBranch = Array.from(branchPerformance.entries())
      .sort(([, a], [, b]) => b - a)[0];

    return topBranch 
      ? `🏆 Bugün ən yaxşı performans göstərən filial: ${topBranch[0]} (${topBranch[1]} ədəd). 
      Toplam günlük sipariş: ${totalOrders}`
      : `Bugün hələ sifariş daxil edilməyib.`;
  }

  public async sendNotification(type: 'comparison' | 'topSelling' | 'insight') {
    try {
      const notificationData = await this.prepareNotificationData(type);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
          data: { type }
        },
        trigger: null,
      });

      console.log('Bildiriş göndərildi:', notificationData);
    } catch (error) {
      console.error('Bildiriş göndərilərkən xəta:', error);
      throw error;
    }
  }
} 