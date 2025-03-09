import { APIResponse, DateRange } from './types';

interface BranchData {
  branchId: string;
  branchName: string;
  products: Record<string, string>;
}

interface BranchSale {
  branchName: string;
  sales: number;
}

interface ProductAnalysis {
  branchSales: BranchSale[];
  totalSales: number;
}

export class AIPromptManager {
  private static instance: AIPromptManager;
  private branches: string[] = [];

  private constructor() {}

  public static getInstance(): AIPromptManager {
    if (!AIPromptManager.instance) {
      AIPromptManager.instance = new AIPromptManager();
    }
    return AIPromptManager.instance;
  }

  public async initializeBranches(): Promise<void> {
    this.branches = [
      'Next Ağşəhər',
      'Next Xətai',
      'Next Mərkəz',
      'Next City Mall',
      'Next Crescent',
      'Coffemania Gəncə',
      'Coffemania Dəniz mall',
      'Coffemania Nərimanov',
      'Coffemania Azadlıq',
      'Coffemania Əhmədli'
    ];
  }

  private analyzeProductByBranch(branchData: BranchData[], productName: string): ProductAnalysis {
    console.log(`\n=== Analyzing ${productName} by Branch ===`);
    
    const branchSales = branchData
      .filter((b: BranchData) => b.branchId !== 'total' && b.products[productName])
      .map((branch: BranchData) => ({
        branchName: branch.branchName,
        sales: parseFloat(branch.products[productName])
      }))
      .sort((a: BranchSale, b: BranchSale) => b.sales - a.sales);

    console.log('Branch Sales:', branchSales);

    const totalSales = parseFloat(
      branchData.find((b: BranchData) => b.branchId === 'total')?.products[productName] || '0'
    );

    console.log('Total Sales:', totalSales);

    return {
      branchSales,
      totalSales
    };
  }

  public createContext(apiResponse: APIResponse): string {
    console.log('\n=== Creating Context ===');
    
    const dateRange = Object.keys(apiResponse)[0];
    const branchData = apiResponse[dateRange];
    const totalData = branchData.find(b => b.branchId === 'total');

    if (!totalData) {
      console.log('No total data found!');
      return '';
    }

    console.log('Date Range:', dateRange);

    // Ən çox satılan məhsulları hesabla
    const sortedProducts = Object.entries(totalData.products)
      .map(([product, amount]) => ({
        product,
        amount: parseFloat(amount)
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    console.log('Top 3 Products:', sortedProducts);

    // Next və Coffemania filiallarını ayır
    const nextBranches = branchData.filter(b => b.branchName.startsWith('Next'));
    const coffemaniaBranches = branchData.filter(b => b.branchName.startsWith('Coffemania'));

    console.log('Next Branches:', nextBranches.length);
    console.log('Coffemania Branches:', coffemaniaBranches.length);

    // Hər məhsul üçün filial analizini hazırla
    const productAnalysis = new Map();
    
    Object.keys(totalData.products).forEach(product => {
      const analysis = this.analyzeProductByBranch(branchData, product);
      productAnalysis.set(product, analysis);
    });

    console.log('\n=== Product Analysis Example ===');
    console.log('Analysis for Profiterol:', productAnalysis.get('Profiterol'));

    const context = `
Tarix aralığı: ${dateRange}

Ümumi məlumatlar:
- Next filialları: ${nextBranches.length} ədəd
- Coffemania filialları: ${coffemaniaBranches.length} ədəd

Ən çox satılan 3 məhsul:
${sortedProducts.map(p => `- ${p.product}: ${p.amount}`).join('\n')}

Filiallar və məhsul çeşidləri:
${branchData
  .filter(b => b.branchId !== 'total')
  .map(branch => {
    const productCount = Object.keys(branch.products).length;
    const productList = Object.entries(branch.products)
      .map(([product, amount]) => `${product}: ${amount}`)
      .join(', ');
    return `- ${branch.branchName}: ${productCount} çeşid məhsul (${productList})`;
  })
  .join('\n')}

Məhsulların filial üzrə təhlili:
${Array.from(productAnalysis.entries())
  .map(([product, analysis]) => {
    const { branchSales, totalSales } = analysis as any;
    if (branchSales.length === 0) return '';
    
    const topBranches = branchSales
      .slice(0, 3)
      .map((b: BranchSale) => `${b.branchName}: ${b.sales} (${((b.sales / totalSales) * 100).toFixed(1)}%)`)
      .join(', ');
    
    return `- ${product}: Cəmi ${totalSales}, Ən yaxşı filialllar: ${topBranches}`;
  })
  .filter(Boolean)
  .join('\n')}

Ümumi satış məlumatları:
${Object.entries(totalData.products)
  .map(([product, amount]) => `- ${product}: ${amount}`)
  .join('\n')}
`;

    console.log('\n=== Final Context ===');
    console.log(context);

    return context;
  }

  public createPrompt(context: string, userMessage: string, dateRange: DateRange): string {
    const questionType = this.determineQuestionType(userMessage);
    
    return `You are Aida's Corner's AI assistant. You MUST ALWAYS respond in Azerbaijani language (not Turkish, specifically Azerbaijani). 
Use Azerbaijani letters like 'ə' instead of 'e' where appropriate.

Here are some examples of Azerbaijani words you should use:
- "məhsul" (not "məhsül" or "ürün")
- "satış" (not "satış" or "satıs")
- "filial" (not "şöbə" or "şube")
- "təhlil" (not "analiz")
- "müqayisə" (not "qarşılaşdırma")
- "dəyər" (not "qiymət")
- "artım" (not "yüksəliş")
- "azalma" (not "düşüş")
- "nəticə" (not "sonuc")

Context information:
${context}

Date range: ${dateRange.startDate} - ${dateRange.endDate}

Question type: ${questionType}
User question: ${userMessage}

When preparing the answer:
1. Show exact numbers and statistics
2. Compare between branches when relevant
3. Note trends if asked
4. Give suggestions only if specifically requested
5. Keep answers concise and directly related to the question
6. Use exact numbers from the data
7. Don't make assumptions about data you don't have

${this.getAdditionalInstructions(questionType)}

Answer (in Azerbaijani):
`;
  }

  private determineQuestionType(question: string): string {
    const keywords = {
      basic: ['neçə', 'hansı', 'nə qədər', 'nə zaman', 'harada'],
      comparison: ['müqayisə', 'fərq', 'daha çox', 'ən çox', 'ən az'],
      analysis: ['təhlil', 'analiz', 'trend', 'inkişaf', 'dəyişim'],
      recommendation: ['təklif', 'tövsiyə', 'nə etməli', 'necə', 'yaxşılaşdırma']
    };

    const lowercaseQuestion = question.toLowerCase();
    
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => lowercaseQuestion.includes(word))) {
        return type;
      }
    }

    return 'basic';
  }

  private getAdditionalInstructions(questionType: string): string {
    const instructions = {
      basic: 'Sadə və birbaşa cavab ver. Rəqəmləri dəqiq göstər.',
      comparison: 'Müqayisəli təhlil apar. Fərqləri və oxşarlıqları vurğula.',
      analysis: 'Dərin təhlil apar. Trendləri və səbəbləri izah et.',
      recommendation: 'Təhlil əsasında konkret təkliflər ver. Hər təklifi əsaslandır.'
    };

    return instructions[questionType as keyof typeof instructions] || instructions.basic;
  }

  public validateResponse(response: string, apiResponse: APIResponse): boolean {
    // Cavab boşdursa və ya çox qısadırsa
    if (!response || response.length < 10) {
      return false;
    }

    const dateRange = Object.keys(apiResponse)[0];
    if (!dateRange || !apiResponse[dateRange]) {
      return false;
    }

    const totalData = apiResponse[dateRange].find(b => b.branchId === 'total');
    if (!totalData) {
      return false;
    }

    // Cavabda rəqəm varsa və ya filial/məhsul adı varsa qəbul et
    const numbers = response.match(/\d+(\.\d+)?/g);
    const branchNames = apiResponse[dateRange].map(b => b.branchName);
    const productNames = Object.keys(totalData.products);
    
    const containsBranchOrProduct = [...branchNames, ...productNames].some(
      name => response.toLowerCase().includes(name.toLowerCase())
    );

    // Əgər cavabda rəqəm varsa və ya filial/məhsul adı varsa, və ya "filial" sözü keçirsə qəbul et
    return !!(numbers || containsBranchOrProduct || response.toLowerCase().includes('filial'));
  }
}
