import { useState, useEffect, useCallback } from 'react';
import { fetchOrdersForDateRange, formatDate } from '@/utils/firebase';
import { QueryDocumentSnapshot } from 'firebase/firestore';

export interface TopProduct {
  name: string;
  count: number;
  trend: 'up' | 'down' | 'neutral';
  percentage: number;
}

export interface TopProductsData {
  products: TopProduct[];
  totalWeeklySales: number;
  weeklyGrowth: number;
  daysRemaining: number;
  weekProgress: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Helper function to get current week's Monday and Sunday
function getCurrentWeekRange(): { startOfWeek: Date; endOfWeek: Date } {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Calculate days since last Monday
  const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - daysSinceMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
}

// Helper function to get previous week's range
function getPreviousWeekRange(): { startOfPrevWeek: Date; endOfPrevWeek: Date } {
  const { startOfWeek } = getCurrentWeekRange();

  const startOfPrevWeek = new Date(startOfWeek);
  startOfPrevWeek.setDate(startOfWeek.getDate() - 7);

  const endOfPrevWeek = new Date(startOfWeek);
  endOfPrevWeek.setDate(startOfWeek.getDate() - 1);

  return { startOfPrevWeek, endOfPrevWeek };
}

// Helper function to calculate product totals from orders data
function calculateProductTotals(ordersData: any): Map<string, number> {
  const productTotals = new Map<string, number>();

  ordersData.forEach((snapshot: any, date: string) => {
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      Object.entries(data).forEach(([product, quantity]) => {
        const currentTotal = productTotals.get(product) || 0;
        productTotals.set(product, currentTotal + (parseInt(quantity as string) || 0));
      });
    });
  });

  return productTotals;
}

// Helper function to calculate percentage change with edge case handling
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0; // If previous was 0 and current > 0, show 100% growth
  }
  return ((current - previous) / previous) * 100;
}

// Helper function to determine trend based on percentage change
function getTrend(percentageChange: number): 'up' | 'down' | 'neutral' {
  const threshold = 0.1; // 0.1% threshold to avoid showing "neutral" for tiny changes
  if (percentageChange > threshold) return 'up';
  if (percentageChange < -threshold) return 'down';
  return 'neutral';
}

export function useTopProductsData(): TopProductsData {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [totalWeeklySales, setTotalWeeklySales] = useState<number>(0);
  const [weeklyGrowth, setWeeklyGrowth] = useState<number>(0);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [weekProgress, setWeekProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { startOfWeek, endOfWeek } = getCurrentWeekRange();
      const { startOfPrevWeek, endOfPrevWeek } = getPreviousWeekRange();

      console.log('Fetching top products data for ranges:', {
        currentWeek: `${formatDate(startOfWeek)} to ${formatDate(endOfWeek)}`,
        previousWeek: `${formatDate(startOfPrevWeek)} to ${formatDate(endOfPrevWeek)}`
      });

      // Fetch data for current week and previous week
      const [currentWeekOrders, previousWeekOrders] = await Promise.all([
        fetchOrdersForDateRange(startOfWeek, endOfWeek),
        fetchOrdersForDateRange(startOfPrevWeek, endOfPrevWeek)
      ]);

      // Calculate product totals for both weeks
      const currentWeekTotals = calculateProductTotals(currentWeekOrders);
      const previousWeekTotals = calculateProductTotals(previousWeekOrders);

      // Get top 3 products for current week
      const sortedCurrentProducts = Array.from(currentWeekTotals.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      // Calculate trends and percentages for top products
      const topProductsWithTrends: TopProduct[] = sortedCurrentProducts.map(([productName, currentSales]) => {
        const previousSales = previousWeekTotals.get(productName) || 0;
        const percentageChange = calculatePercentageChange(currentSales, previousSales);
        const trend = getTrend(percentageChange);

        return {
          name: productName,
          count: currentSales,
          trend,
          percentage: Math.abs(Math.round(percentageChange * 10) / 10) // Round to 1 decimal place
        };
      });

      // Calculate total weekly sales
      const currentWeekTotal = Array.from(currentWeekTotals.values()).reduce((sum, count) => sum + count, 0);
      const previousWeekTotal = Array.from(previousWeekTotals.values()).reduce((sum, count) => sum + count, 0);

      // Calculate weekly growth
      const weeklyGrowthPercentage = calculatePercentageChange(currentWeekTotal, previousWeekTotal);

      // Calculate days remaining and week progress
      const today = new Date();
      const daysInWeek = 7;
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const daysUntilSunday = 6 - daysSinceMonday;
      const progressPercentage = ((daysSinceMonday + 1) / daysInWeek) * 100;

      setProducts(topProductsWithTrends);
      setTotalWeeklySales(currentWeekTotal);
      setWeeklyGrowth(Math.round(weeklyGrowthPercentage * 10) / 10); // Round to 1 decimal place
      setDaysRemaining(daysUntilSunday);
      setWeekProgress(Math.round(progressPercentage));

      console.log('Top products data fetched successfully:', {
        topProducts: topProductsWithTrends,
        currentWeekTotal,
        previousWeekTotal,
        weeklyGrowth: weeklyGrowthPercentage
      });

    } catch (err) {
      console.error('Error fetching top products data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Məhsul məlumatları yüklənərkən xəta baş verdi';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    products,
    totalWeeklySales,
    weeklyGrowth,
    daysRemaining,
    weekProgress,
    loading,
    error,
    refetch: fetchData
  };
}