import { 
  SalesData, 
  BranchGroups, 
  ProductGroups, 
  ComparisonResult, 
  TrendAnalysis,
  DateRange 
} from './types';

export class DataProcessor {
  private static instance: DataProcessor;
  private branchGroups: BranchGroups = {
    next: ['Next Mərkəz', 'Next Ağşəhər', 'Next Cresecent', 'Next City Mall'],
    coffemania: ['Coffemania Azadlıq', 'Coffemania Gəncə', 'Coffemania Dəniz Mall', 'Coffemania Nərimanov', 'Coffemania Əhmədli']
  };

  private constructor() {}

  public static getInstance(): DataProcessor {
    if (!DataProcessor.instance) {
      DataProcessor.instance = new DataProcessor();
    }
    return DataProcessor.instance;
  }

  // Veri normalizasyonu
  private normalizeProductName(name: string): string {
    return name.toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\s*$/, '');
  }

  // Veri dönüşümü
  public processOrders(orders: Record<string, Record<string, any>>): {
    salesData: Record<string, SalesData>;
    productGroups: ProductGroups;
  } {
    const salesData: Record<string, SalesData> = {};
    const productGroups: ProductGroups = {
      A: [], B: [], C: [], D: [], E: []
    };

    try {
      // Her tarih için
      Object.entries(orders).forEach(([date, branchData]) => {
        // Her şube için
        Object.entries(branchData).forEach(([branch, products]) => {
          // Her ürün için
          Object.entries(products).forEach(([product, quantity]: [string, any]) => {
            const normalizedName = this.normalizeProductName(product);
            
            if (!salesData[normalizedName]) {
              salesData[normalizedName] = {
                product: {
                  name: product,
                  normalizedName,
                  category: this.determineCategory(product),
                  restrictions: this.getRestrictions(product)
                },
                sales: {
                  total: 0,
                  byBranch: {},
                  byGroup: { next: 0, coffemania: 0 },
                  daily: []
                },
                trends: {
                  maxDay: { date: '', amount: 0 },
                  minDay: { date: '', amount: Number.MAX_VALUE },
                  average: 0,
                  growth: 0
                }
              };
            }

            const numQuantity = this.parseQuantity(quantity);
            if (numQuantity > 0) {
              this.updateSalesData(salesData[normalizedName], date, branch, numQuantity);
            }
          });
        });
      });

      // Ürün gruplarını hesapla
      Object.entries(salesData).forEach(([product, data]) => {
        if (data.sales.total >= 500) productGroups.A.push(product);
        else if (data.sales.total >= 200) productGroups.B.push(product);
        else if (data.sales.total >= 100) productGroups.C.push(product);
        else if (data.sales.total >= 50) productGroups.D.push(product);
        else productGroups.E.push(product);
      });

      // Trend hesaplamaları
      Object.values(salesData).forEach(data => {
        this.calculateTrends(data);
      });

      return { salesData, productGroups };
    } catch (error) {
      console.error('Veri işleme hatası:', error);
      return { salesData: {}, productGroups: { A: [], B: [], C: [], D: [], E: [] } };
    }
  }

  // Yardımcı metodlar
  private parseQuantity(quantity: any): number {
    if (typeof quantity === 'string') {
      return parseFloat(quantity.replace(',', '.'));
    }
    if (typeof quantity === 'number') {
      return quantity;
    }
    return 0;
  }

  private determineCategory(product: string): string {
    // Ürün kategorisini belirle
    const normalizedProduct = this.normalizeProductName(product);
    if (normalizedProduct.includes('şokolad')) return 'Şokolad';
    if (normalizedProduct.includes('tort')) return 'Tort';
    // Diğer kategoriler...
    return 'Digər';
  }

  private getRestrictions(product: string): string[] {
    const restrictions: string[] = [];
    const normalizedProduct = this.normalizeProductName(product);
    
    if (normalizedProduct.includes('şokolad lokumlu')) {
      restrictions.push('YALNIZ_NEXT');
    }
    if (normalizedProduct === 'şokolad') {
      restrictions.push('YALNIZ_COFFEMANIA');
    }
    
    return restrictions;
  }

  private updateSalesData(
    data: SalesData, 
    date: string, 
    branch: string, 
    quantity: number
  ): void {
    // Ürün kısıtlamalarını kontrol et
    const restrictions = data.product.restrictions || [];
    const isNextBranch = this.branchGroups.next.includes(branch);
    const isCoffemania = this.branchGroups.coffemania.includes(branch);

    // YALNIZ_NEXT kısıtlaması varsa ve Coffemania şubesiyse güncelleme yapma
    if (restrictions.includes('YALNIZ_NEXT') && !isNextBranch) {
      return;
    }

    // YALNIZ_COFFEMANIA kısıtlaması varsa ve Next şubesiyse güncelleme yapma
    if (restrictions.includes('YALNIZ_COFFEMANIA') && !isCoffemania) {
      return;
    }

    // Toplam satışları güncelle
    data.sales.total += quantity;

    // Şube bazlı satışları güncelle
    data.sales.byBranch[branch] = (data.sales.byBranch[branch] || 0) + quantity;

    // Grup bazlı satışları güncelle
    if (isNextBranch) {
      data.sales.byGroup.next += quantity;
    } else if (isCoffemania) {
      data.sales.byGroup.coffemania += quantity;
    }

    // Günlük satışları güncelle
    data.sales.daily.push({ date, amount: quantity, branch });

    // Min/Max günleri güncelle
    const currentDate = new Date(date);
    if (quantity > data.trends.maxDay.amount || 
        (quantity === data.trends.maxDay.amount && 
         currentDate > new Date(data.trends.maxDay.date))) {
      data.trends.maxDay = { date, amount: quantity };
    }
    if (quantity < data.trends.minDay.amount || 
        data.trends.minDay.amount === Number.MAX_VALUE ||
        (quantity === data.trends.minDay.amount && 
         currentDate < new Date(data.trends.minDay.date))) {
      data.trends.minDay = { date, amount: quantity };
    }
  }

  private calculateTrends(data: SalesData): void {
    if (data.sales.daily.length === 0) return;

    // Günlük satışları tarihe göre sırala
    const sortedDays = [...data.sales.daily].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Ortalama hesapla
    const total = sortedDays.reduce((sum, day) => sum + day.amount, 0);
    data.trends.average = total / sortedDays.length;

    // Büyüme oranı hesapla
    if (sortedDays.length > 1) {
      const firstDay = sortedDays[0].amount;
      const lastDay = sortedDays[sortedDays.length - 1].amount;
      data.trends.growth = ((lastDay - firstDay) / firstDay) * 100;
    }
  }

  // Karşılaştırma metodları
  public compareBranches(branch1: string, branch2: string, products: string[]): ComparisonResult[] {
    return products.map(product => {
      const sales1 = this.getBranchSales(branch1, product);
      const sales2 = this.getBranchSales(branch2, product);
      
      const difference = sales1 - sales2;
      const percentage = sales2 !== 0 ? (difference / sales2) * 100 : 0;
      
      return {
        product,
        difference: {
          absolute: difference,
          percentage
        },
        efficiency: this.calculateEfficiency(sales1, sales2, product)
      };
    });
  }

  private getBranchSales(branch: string, product: string): number {
    // İlgili şubenin ürün satışını bul
    return 0; // TODO: Implement
  }

  private calculateEfficiency(sales1: number, sales2: number, product: string): {
    score: number;
    better: 'next' | 'coffemania' | 'equal';
    reason: string;
  } {
    // Verimlilik hesapla
    return {
      score: 0,
      better: 'equal',
      reason: ''
    }; // TODO: Implement
  }

  // Trend analiz metodları
  public analyzeTrends(dateRange: DateRange, products: string[]): TrendAnalysis[] {
    return products.map(product => ({
      product,
      trend: {
        direction: 'stable' as const,
        changeRate: 0
      },
      peakDays: [],
      growth: {
        daily: 0,
        weekly: 0,
        monthly: 0
      }
    })); // TODO: Implement
  }
} 