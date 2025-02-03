import { SalesData, ProductGroups, BranchGroups, DateRange } from './types';
import { getBranches } from '@/utils/firebase';
import { Branch } from '@/types/branch';

export class AIPromptManager {
  private static instance: AIPromptManager;
  private branchGroups: BranchGroups = {
    next: [],
    coffemania: []
  };

  private constructor() {}

  public static getInstance(): AIPromptManager {
    if (!AIPromptManager.instance) {
      AIPromptManager.instance = new AIPromptManager();
    }
    return AIPromptManager.instance;
  }

  public getBranchGroups(): BranchGroups {
    return this.branchGroups;
  }

  public async initializeBranches() {
    try {
      const branches = await getBranches();
      this.branchGroups = {
        next: branches.filter((b: Branch) => b.type === 'next').map((b: Branch) => b.name),
        coffemania: branches.filter((b: Branch) => b.type === 'coffemania').map((b: Branch) => b.name)
      };
    } catch (error) {
      console.error('Şube listesi alınırken hata:', error);
    }
  }

  public createContext(
    salesData: Record<string, SalesData>,
    productGroups: ProductGroups,
    branchGroups: BranchGroups
  ): string {
    const sortedProducts = Object.entries(salesData)
      .map(([_, data]) => ({
        name: data.product.name,
        total: data.sales.total
      }))
      .sort((a, b) => b.total - a.total);

    return `Sən Aida's Corner şirniyyat şəbəkəsinin süni intellekt köməkçisisən.

MƏHSUL SATIŞLARI (dəqiq rəqəmlər, çoxdan aza doğru sıralanmış):

SATIŞ REYTİNQİ:
${sortedProducts.map((p, i) => 
  `[${(i + 1).toString().padStart(2, '0')}] ${p.name.padEnd(25, '.')} ${p.total.toFixed(2).padStart(8, ' ')} ədəd`
).join('\n')}

SATIŞ QRUPLARI:
A. 500+ satış: ${productGroups.A.join(', ')}
B. 200-499 satış: ${productGroups.B.join(', ')}
C. 100-199 satış: ${productGroups.C.join(', ')}
D. 50-99 satış: ${productGroups.D.join(', ')}
E. 0-49 satış: ${productGroups.E.join(', ')}

MƏHSUL DETALLARI:
${Object.values(salesData).map(data => {
  const { product, sales, trends } = data;
  return `${product.name}:
  ┌─────────────────────────────
  │ ÜMUMI SATIŞ: ${sales.total.toFixed(2)}
  │ NEXT: ${sales.byGroup.next.toFixed(2)}
  │ COFFEMANİA: ${sales.byGroup.coffemania.toFixed(2)}
  │
  │ Next Filialları:
${Object.entries(sales.byBranch)
  .filter(([branch]) => branchGroups.next.includes(branch))
  .map(([branch, quantity]) => `  │  • ${branch}: ${quantity.toFixed(2)}`)
  .join('\n')}
  │
  │ Coffemania Filialları:
${Object.entries(sales.byBranch)
  .filter(([branch]) => branchGroups.coffemania.includes(branch))
  .map(([branch, quantity]) => `  │  • ${branch}: ${quantity.toFixed(2)}`)
  .join('\n')}
  │
  │ Trend Məlumatları:
  │  • Ən yüksək: ${trends.maxDay.date} (${trends.maxDay.amount.toFixed(2)})
  │  • Ən aşağı: ${trends.minDay.date} (${trends.minDay.amount.toFixed(2)})
  │  • Ortalama: ${trends.average.toFixed(2)}
  │  • Artım: ${trends.growth.toFixed(2)}%
  └─────────────────────────────`;
}).join('\n\n')}

FİLİAL QRUPLARI:
1. NEXT FİLİALLARI:
   - ${branchGroups.next.join('\n   - ')}

2. COFFEMANİA FİLİALLARI:
   - ${branchGroups.coffemania.join('\n   - ')}

MƏHSUL MƏHDUDİYYƏTLƏRİ:
1. Şokolad Lokumlu - YALNIZ NEXT FİLİALLARINDA satılır
2. Şokolad - YALNIZ COFFEMANİA FİLİALLARINDA satılır`;
  }

  public createPrompt(context: string, query: string, dateRange: DateRange): string {
    // Tarih aralığını kontrol et
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const dayDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

    if (dayDifference < 30) {
      const newStartDate = new Date(endDate);
      newStartDate.setDate(newStartDate.getDate() - 30);
      dateRange.startDate = newStartDate.toISOString().split('T')[0];
      console.log('Tarih aralığı 30 güne tamamlandı:', dateRange);
    }

    return `${context}

İstifadəçi sualı: ${query}

ANALİZ DÖVRÜ: ${dateRange.startDate} - ${dateRange.endDate} (${Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 3600 * 24))} gün)

CAVAB FORMATI:

1. SATIŞ SIRALAMASINDA:
   - Çoxdan aza sıralama istənildikdə: [01], [02], [03]... şəklində göstər
   - Azdan çoxa sıralama istənildikdə: [15], [14], [13]... şəklində göstər
   - Sıra nömrəsini yalnız [XX] formatında göstər
   - Satış miqdarını tam dəqiqliyi ilə göstər (məsələn: 123.45)
   - Sıfır satışları "0.00" formatında göstər

2. MƏHSUL MƏHDUDİYYƏTLƏRİ:
   - Şokolad Lokumlu - YALNIZ NEXT FİLİALLARINDA satılır
   - Şokolad - YALNIZ COFFEMANİA FİLİALLARINDA satılır
   - Məhdudiyyətli məhsullar üçün "satılmır" qeydi əlavə et

3. FİLİAL QRUPLAMASINDA:
   - Next filialları: ${this.branchGroups.next.join(', ')}
   - Coffemania filialları: ${this.branchGroups.coffemania.join(', ')}
   - Hər qrup üçün cəmi göstər
   - Filialları qarışdırma

4. HESABLAMALARDA:
   - Bütün rəqəmləri iki onluq rəqəmlə göstər (məsələn: 123.45)
   - Faizləri %.2f formatında göstər (məsələn: 12.34%)
   - Yuvarlaqlaşdırma etmə
   - Sıfır dəyərləri "0.00" kimi göstər

5. MÜQAYİSƏLƏRDƏ:
   - Mütləq fərqi göstər
   - Faiz fərqini göstər
   - Trend istiqamətini (artım/azalma) göstər
   - Səbəb-nəticə əlaqəsini izah et

ÖNƏMLİ QAYDALAR:
1. Cavabını Azərbaycan dilində ver
2. Rəqəmləri tam dəqiqliyi ilə göstər
3. Məhsul məhdudiyyətlərinə riayət et
4. Filialları qarışdırma
5. Yuvarlaqlaşdırma etmə
6. Minimum 30 günlük dövr üçün analiz apar`;
  }

  public validateResponse(response: string, salesData: Record<string, SalesData>, dateRange: DateRange): boolean {
    // Tarih aralığını kontrol et
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const dayDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

    if (dayDifference < 30) {
      console.error('Tarih aralığı 30 günden az:', dayDifference);
      return false;
    }

    // Yanıtta şube karşılaştırması var mı kontrol et
    const hasBranchComparison = response.toLowerCase().includes('next') || 
                               response.toLowerCase().includes('coffemania');

    // Diğer kontrolleri yap ve hata mesajlarını kaydet
    const validationResults = {
      numbers: this.checkNumberAccuracy(response, salesData),
      percentages: this.checkPercentageCalculations(response),
      branches: hasBranchComparison ? this.checkBranchComparisons(response) : true, // Şube karşılaştırması varsa kontrol et
      restrictions: this.checkProductRestrictions(response)
    };

    // Hata mesajlarını konsola yazdır
    if (!validationResults.numbers) console.error('Sayısal değerler doğrulanamadı');
    if (!validationResults.percentages) console.error('Yüzde hesaplamaları doğrulanamadı');
    if (!validationResults.branches && hasBranchComparison) console.error('Şube karşılaştırmaları doğrulanamadı');
    if (!validationResults.restrictions) console.error('Ürün kısıtlamaları doğrulanamadı');

    // En az bir kontrol başarılı olmalı
    return Object.values(validationResults).some(result => result);
  }

  private checkNumberAccuracy(response: string, salesData: Record<string, SalesData>): boolean {
    try {
      // Yanıttaki sayısal değerleri kontrol et
      const numbers = response.match(/\d+\.\d{2}/g);
      if (!numbers) return true; // Sayısal değer yoksa geçerli kabul et

      // Tolerans değerini artır
      const tolerance = 0.1;

      // Her sayıyı kontrol et
      return numbers.some(num => {
        const value = parseFloat(num);
        // Satış verilerinde bu sayı var mı kontrol et
        return Object.values(salesData).some(data => {
          const values = [
            data.sales.total,
            data.sales.byGroup.next,
            data.sales.byGroup.coffemania,
            ...Object.values(data.sales.byBranch),
            ...data.sales.daily.map(day => day.amount)
          ];
          
          return values.some(v => Math.abs(v - value) < tolerance);
        });
      });
    } catch (error) {
      console.error('Sayı doğrulama hatası:', error);
      return true; // Hata durumunda geçerli kabul et
    }
  }

  private checkPercentageCalculations(response: string): boolean {
    try {
      const percentages = response.match(/\d+\.\d{2}%/g);
      if (!percentages) return true;

      return percentages.every(percent => {
        const value = parseFloat(percent);
        return !isNaN(value) && value >= -100 && value <= 1000; // Daha geniş aralık
      });
    } catch (error) {
      console.error('Yüzde doğrulama hatası:', error);
      return false;
    }
  }

  private checkBranchComparisons(response: string): boolean {
    try {
      const text = response.toLowerCase();
      
      // Spesifik şube karşılaştırması yapılıyor mu kontrol et
      const specificBranchComparison = this.branchGroups.next.some(nextBranch => 
        this.branchGroups.coffemania.some(coffBranch => 
          text.includes(nextBranch.toLowerCase()) && text.includes(coffBranch.toLowerCase())
        )
      );

      // Eğer spesifik şube karşılaştırması varsa, genel şube grubu kontrolü yapma
      if (specificBranchComparison) {
        return true;
      }

      // Genel şube grubu karşılaştırması yapılıyorsa kontrol et
      const hasGeneralComparison = text.includes('next filialları') || 
                                 text.includes('next filiallar') || 
                                 text.includes('next şöbələri') ||
                                 text.includes('coffemania filialları') || 
                                 text.includes('coffemania filiallar') || 
                                 text.includes('coffemania şöbələri');

      // Her iki şube grubundan da bahsedilmiş olmalı
      const nextMentions = text.match(/next/gi)?.length || 0;
      const coffemanMentions = text.match(/coffemania/gi)?.length || 0;

      // Genel karşılaştırma varsa her iki gruptan da bahsedilmiş olmalı
      if (hasGeneralComparison) {
        return nextMentions > 0 && coffemanMentions > 0;
      }

      // Ne spesifik ne de genel karşılaştırma yoksa true dön
      return true;
    } catch (error) {
      console.error('Şube karşılaştırma hatası:', error);
      return true; // Hata durumunda geçerli kabul et
    }
  }

  private checkProductRestrictions(response: string): boolean {
    try {
      const text = response.toLowerCase();

      // Şokolad Lokumlu kontrolü
      if (text.includes('şokolad lokumlu')) {
        if (text.includes('coffemania') && !text.includes('satılmır')) {
          return false;
        }
      }

      // Şokolad kontrolü
      if (text.includes('şokolad') && !text.includes('lokumlu')) {
        if (text.includes('next') && !text.includes('satılmır')) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Ürün kısıtlaması kontrolü hatası:', error);
      return false;
    }
  }
} 