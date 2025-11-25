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

// Helper function to get current month's first and last day
function getCurrentMonthRange(): { startOfMonth: Date; endOfMonth: Date } {
  const today = new Date();

  // First day of current month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Last day of current month
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  return { startOfMonth, endOfMonth };
}

// Helper function to get previous month's range
function getPreviousMonthRange(): { startOfPrevMonth: Date; endOfPrevMonth: Date } {
  const today = new Date();

  // First day of previous month
  const startOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  startOfPrevMonth.setHours(0, 0, 0, 0);

  // Last day of previous month
  const endOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  endOfPrevMonth.setHours(23, 59, 59, 999);

  return { startOfPrevMonth, endOfPrevMonth };
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

      const { startOfMonth, endOfMonth } = getCurrentMonthRange();
      const { startOfPrevMonth, endOfPrevMonth } = getPreviousMonthRange();

      console.log('Fetching top products data for ranges:', {
        currentMonth: `${formatDate(startOfMonth)} to ${formatDate(endOfMonth)}`,
        previousMonth: `${formatDate(startOfPrevMonth)} to ${formatDate(endOfPrevMonth)}`
      });

      // Fetch data for current month and previous month
      const [currentMonthOrders, previousMonthOrders] = await Promise.all([
        fetchOrdersForDateRange(startOfMonth, endOfMonth),
        fetchOrdersForDateRange(startOfPrevMonth, endOfPrevMonth)
      ]);

      // Calculate product totals for both months
      const currentMonthTotals = calculateProductTotals(currentMonthOrders);
      const previousMonthTotals = calculateProductTotals(previousMonthOrders);

      // Get top 3 products for current month
      const sortedCurrentProducts = Array.from(currentMonthTotals.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      // Calculate trends and percentages for top products
      const topProductsWithTrends: TopProduct[] = sortedCurrentProducts.map(([productName, currentSales]) => {
        const previousSales = previousMonthTotals.get(productName) || 0;
        const percentageChange = calculatePercentageChange(currentSales, previousSales);
        const trend = getTrend(percentageChange);

        return {
          name: productName,
          count: currentSales,
          trend,
          percentage: Math.abs(Math.round(percentageChange * 10) / 10) // Round to 1 decimal place
        };
      });

      // Calculate total monthly sales
      const currentMonthTotal = Array.from(currentMonthTotals.values()).reduce((sum, count) => sum + count, 0);
      const previousMonthTotal = Array.from(previousMonthTotals.values()).reduce((sum, count) => sum + count, 0);

      // Calculate monthly growth
      const monthlyGrowthPercentage = calculatePercentageChange(currentMonthTotal, previousMonthTotal);

      // Calculate days remaining and month progress
      const today = new Date();
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const currentDay = today.getDate();
      const daysUntilMonthEnd = lastDayOfMonth - currentDay;
      const progressPercentage = (currentDay / lastDayOfMonth) * 100;

      setProducts(topProductsWithTrends);
      setTotalWeeklySales(currentMonthTotal);
      setWeeklyGrowth(Math.round(monthlyGrowthPercentage * 10) / 10); // Round to 1 decimal place
      setDaysRemaining(daysUntilMonthEnd);
      setWeekProgress(Math.round(progressPercentage));

      console.log('Top products data fetched successfully:', {
        topProducts: topProductsWithTrends,
        currentMonthTotal,
        previousMonthTotal,
        monthlyGrowth: monthlyGrowthPercentage
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