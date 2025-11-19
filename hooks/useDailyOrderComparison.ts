import { useState, useEffect } from 'react';
import { fetchOrdersForDateRange, formatDate } from '@/utils/firebase';
import { QueryDocumentSnapshot } from 'firebase/firestore';

interface DailyComparisonData {
  percentage: number;
  trend: 'increase' | 'decrease' | 'neutral';
  currentDayTotal: number;
  previousDayTotal: number;
  message: string;
  messageParts: {
    prefix: string;
    percentage: string;
    suffix: string;
    color: 'green' | 'red' | 'default';
  };
  isLoading: boolean;
  error: string | null;
  comparisonType: 'today_vs_yesterday' | 'yesterday_vs_daybefore' | 'no_data';
}

const useDailyOrderComparison = () => {
  const [data, setData] = useState<DailyComparisonData>({
    percentage: 0,
    trend: 'neutral',
    currentDayTotal: 0,
    previousDayTotal: 0,
    message: 'Yüklənir...',
    messageParts: {
      prefix: 'Yüklənir...',
      percentage: '',
      suffix: '',
      color: 'default'
    },
    isLoading: true,
    error: null,
    comparisonType: 'today_vs_yesterday'
  });

  const calculateDayTotal = async (date: Date): Promise<number> => {
    try {
      const orders = await fetchOrdersForDateRange(date, date);
      let total = 0;

      orders.forEach((snapshot, dateKey) => {
        snapshot.forEach((doc: QueryDocumentSnapshot) => {
          const docData = doc.data();
          Object.values(docData).forEach(quantity => {
            total += parseInt(quantity as string) || 0;
          });
        });
      });

      return total;
    } catch (error) {
      console.error('Günlük sifarişlər hesablanarkən xəta:', error);
      return 0;
    }
  };

  const generateMessage = (
    percentage: number,
    trend: 'increase' | 'decrease' | 'neutral',
    total: number,
    comparisonType: 'today_vs_yesterday' | 'yesterday_vs_daybefore' | 'no_data'
  ): { message: string; messageParts: DailyComparisonData['messageParts'] } => {
    if (comparisonType === 'no_data' || total === 0) {
      return {
        message: 'Sifariş məlumatları mövcud deyil',
        messageParts: {
          prefix: 'Sifariş məlumatları mövcud deyil',
          percentage: '',
          suffix: '',
          color: 'default'
        }
      };
    }

    const roundedPercentage = Math.round(percentage);
    const trendText = trend === 'increase' ? 'artım' : trend === 'decrease' ? 'düşüş' : 'sabit';
    const dayText = comparisonType === 'today_vs_yesterday' ? 'Bugünkü' : 'Dünənki';
    const color = trend === 'increase' ? 'green' : trend === 'decrease' ? 'red' : 'default';

    if (trend === 'neutral') {
      return {
        message: `${dayText} sifarişlər sabitdir`,
        messageParts: {
          prefix: `${dayText} sifarişlər `,
          percentage: '',
          suffix: `sabitdir`,
          color: 'default'
        }
      };
    }

    return {
      message: `${dayText} sifarişlər ${roundedPercentage}% ${trendText} göstərir`,
      messageParts: {
        prefix: `${dayText} sifarişlər `,
        percentage: `${roundedPercentage}% ${trendText}`,
        suffix: ` göstərir`,
        color: color
      }
    };
  };

  const fetchDailyComparison = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const dayBeforeYesterday = new Date(today);
      dayBeforeYesterday.setDate(today.getDate() - 2);

      // Try today vs yesterday first
      const todayTotal = await calculateDayTotal(today);
      const yesterdayTotal = await calculateDayTotal(yesterday);

      let finalData: DailyComparisonData;

      if (todayTotal > 0) {
        // We have today's data - compare today vs yesterday
        const percentage = yesterdayTotal === 0 ?
          (todayTotal > 0 ? 100 : 0) :
          ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;

        const trend = percentage > 0 ? 'increase' : percentage < 0 ? 'decrease' : 'neutral';

        const messageData = generateMessage(percentage, trend, todayTotal, 'today_vs_yesterday');
        finalData = {
          percentage: Math.round(percentage),
          trend,
          currentDayTotal: todayTotal,
          previousDayTotal: yesterdayTotal,
          message: messageData.message,
          messageParts: messageData.messageParts,
          isLoading: false,
          error: null,
          comparisonType: 'today_vs_yesterday'
        };
      } else if (yesterdayTotal > 0) {
        // No today's data yet, but we have yesterday's - compare yesterday vs day before
        const dayBeforeTotal = await calculateDayTotal(dayBeforeYesterday);

        const percentage = dayBeforeTotal === 0 ?
          (yesterdayTotal > 0 ? 100 : 0) :
          ((yesterdayTotal - dayBeforeTotal) / dayBeforeTotal) * 100;

        const trend = percentage > 0 ? 'increase' : percentage < 0 ? 'decrease' : 'neutral';

        const messageData = generateMessage(percentage, trend, yesterdayTotal, 'yesterday_vs_daybefore');
        finalData = {
          percentage: Math.round(percentage),
          trend,
          currentDayTotal: yesterdayTotal,
          previousDayTotal: dayBeforeTotal,
          message: messageData.message,
          messageParts: messageData.messageParts,
          isLoading: false,
          error: null,
          comparisonType: 'yesterday_vs_daybefore'
        };
      } else {
        // No data for today or yesterday
        const messageData = generateMessage(0, 'neutral', 0, 'no_data');
        finalData = {
          percentage: 0,
          trend: 'neutral',
          currentDayTotal: 0,
          previousDayTotal: 0,
          message: messageData.message,
          messageParts: messageData.messageParts,
          isLoading: false,
          error: null,
          comparisonType: 'no_data'
        };
      }

      setData(finalData);
    } catch (error) {
      console.error('Günlük müqayisə məlumatları alınarkən xəta:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Məlumatlar alınarkən xəta baş verdi',
        message: 'Məlumatlar alınarkən xəta baş verdi',
        messageParts: {
          prefix: 'Məlumatlar alınarkən xəta baş verdi',
          percentage: '',
          suffix: '',
          color: 'default'
        }
      }));
    }
  };

  useEffect(() => {
    fetchDailyComparison();

    // Real-time updates - refresh every 30 seconds for near real-time feel
    const interval = setInterval(fetchDailyComparison, 30000);

    return () => clearInterval(interval);
  }, []);

  // Manual refresh function
  const refresh = () => {
    fetchDailyComparison();
  };

  return {
    ...data,
    refresh
  };
};

export default useDailyOrderComparison;