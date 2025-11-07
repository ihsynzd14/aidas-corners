import { useState, useEffect, useCallback } from 'react';
import { fetchOrdersForDateRange, formatDate } from '../../utils/firebase';

export interface ProductDataPoint {
  name: string;
  data: {
    date: string;
    quantity: number;
  }[];
  color: string;
  totalQuantity: number;
}

export interface AnalyticsData {
  productData: ProductDataPoint[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
  totalSales: number;
  totalProducts: number;
  averageDailySales: number;
}

// Color palette for chart lines
const CHART_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7AF', '#96CEB4', '#FFEAA7', 
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
  '#A3E4D7', '#F9E79F', '#FADBD8', '#D5DBDB', '#AED6F1',
  '#A9DFBF', '#F4D03F', '#E8DAEF', '#D1F2EB', '#FCF3CF',
  '#EBDEF0', '#D6EAF8', '#D4EDDA', '#FFF3CD', '#F8D7DA'
];

export function useAnalyticsData(startDate: Date, endDate: Date) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableProducts, setAvailableProducts] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching analytics data for date range:', {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      });

      const ordersData = await fetchOrdersForDateRange(startDate, endDate);
      
      // Process the data to create analytics
      const productTotals = new Map<string, Map<string, number>>();
      const allProducts = new Set<string>();
      
      // Generate all dates in range for consistent data points
      const dates = getDatesInRange(startDate, endDate);
      
      ordersData.forEach((branchesSnapshot: any, date: string) => {
        branchesSnapshot.forEach((branchDoc: any) => {
          const branchData = branchDoc.data();
          
          Object.entries(branchData).forEach(([product, quantity]: [string, any]) => {
            const productName = product; // Don't trim product names
            allProducts.add(productName);
            
            if (!productTotals.has(productName)) {
              productTotals.set(productName, new Map());
            }
            
            const productDateMap = productTotals.get(productName)!;
            const currentQuantity = productDateMap.get(date) || 0;
            productDateMap.set(date, currentQuantity + (parseInt(quantity as string) || 0));
          });
        });
      });

      // Convert to chart data format
      const productDataArray: ProductDataPoint[] = Array.from(allProducts).map((productName, index) => {
        const productDateMap = productTotals.get(productName) || new Map();
        
        const data = dates.map(date => ({
          date,
          quantity: productDateMap.get(date) || 0
        }));

        const totalQuantity = data.reduce((sum, point) => sum + point.quantity, 0);

        return {
          name: productName,
          data,
          color: CHART_COLORS[index % CHART_COLORS.length],
          totalQuantity
        };
      });

      // Sort by total quantity (descending)
      productDataArray.sort((a, b) => b.totalQuantity - a.totalQuantity);

      // Calculate summary statistics
      const totalSales = productDataArray.reduce((sum, product) => sum + product.totalQuantity, 0);
      const totalProducts = productDataArray.length;
      const averageDailySales = totalSales / dates.length;

      const analyticsData: AnalyticsData = {
        productData: productDataArray,
        dateRange: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate)
        },
        totalSales,
        totalProducts,
        averageDailySales
      };

      setData(analyticsData);
      const sortedProducts = Array.from(allProducts).sort();
      console.log('Available products:', sortedProducts);
      setAvailableProducts(sortedProducts);
      
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    availableProducts,
    refetch: fetchData
  };
}

// Helper function to generate date range
function getDatesInRange(start: Date, end: Date): string[] {
  const dates = [];
  const current = new Date(start);
  const endDate = new Date(end);
  
  while (current <= endDate) {
    dates.push(formatDate(new Date(current)));
    current.setDate(current.getDate() + 1);
  }
  return dates;
} 