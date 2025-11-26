import { getProductCorrections, ProductDefinition } from '@/utils/firebase';

class OrderCorrectionService {
  private corrections: ProductDefinition[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private isLoading: boolean = false;
  private loadPromise: Promise<ProductDefinition[]> | null = null;

  async getCorrections(): Promise<ProductDefinition[]> {
    const now = Date.now();

    // Return cached data if still valid
    if (this.corrections.length > 0 && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.corrections;
    }

    // If already loading, return the existing promise
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    // Start loading
    this.isLoading = true;
    this.loadPromise = this.loadCorrections();

    try {
      this.corrections = await this.loadPromise;
      this.lastFetch = now;
      return this.corrections;
    } catch (error) {
      console.error('Error fetching corrections:', error);
      // Return cached data if available, even if expired
      if (this.corrections.length > 0) {
        console.warn('Using expired cache due to fetch error');
        return this.corrections;
      }
      throw error;
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  private async loadCorrections(): Promise<ProductDefinition[]> {
    try {
      const corrections = await getProductCorrections();
      console.log(`Loaded ${corrections.length} product corrections from Firebase`);
      return corrections;
    } catch (error) {
      console.error('Failed to load corrections from Firebase:', error);
      // If it's an index error, provide helpful message
      if (error instanceof Error && error.message.includes('requires an index')) {
        console.log('💡 Tip: Create the required Firebase index for better performance');
        console.log('   The system will work with client-side filtering until index is created');
      }
      throw error;
    }
  }

  // Get corrections as legacy format for backward compatibility
  async getLegacyCorrections(): Promise<Array<{ correct: string, variations: string[], units?: any }>> {
    const corrections = await this.getCorrections();
    return corrections.map(({ correct, variations, units }) => ({
      correct,
      variations,
      units
    }));
  }

  // Search corrections by text
  async searchCorrections(searchText: string): Promise<ProductDefinition[]> {
    const corrections = await this.getCorrections();
    const searchLower = searchText.toLowerCase().trim();

    if (!searchLower) return corrections;

    return corrections.filter(correction =>
      correction.correct.toLowerCase().includes(searchLower) ||
      correction.variations.some(v => v.toLowerCase().includes(searchLower))
    );
  }

  // Get correction by product name
  async getCorrectionByName(productName: string): Promise<ProductDefinition | null> {
    const corrections = await this.getCorrections();
    const searchLower = productName.toLowerCase().trim();

    return corrections.find(correction =>
      correction.correct.toLowerCase() === searchLower ||
      correction.variations.some(v => v.toLowerCase() === searchLower)
    ) || null;
  }

  // Force clear cache (useful for testing)
  clearCache(): void {
    this.corrections = [];
    this.lastFetch = 0;
    this.isLoading = false;
    this.loadPromise = null;
  }

  // Get cache status for debugging
  getCacheStatus(): {
    hasData: boolean;
    lastFetch: number;
    isExpired: boolean;
    isLoading: boolean;
  } {
    const now = Date.now();
    return {
      hasData: this.corrections.length > 0,
      lastFetch: this.lastFetch,
      isExpired: (now - this.lastFetch) > this.CACHE_DURATION,
      isLoading: this.isLoading
    };
  }

  // Force refresh and get latest corrections
  async refreshCorrections(): Promise<ProductDefinition[]> {
    console.log('🔄 Force refreshing product corrections...');
    this.clearCache(); // Clear cache to force fresh fetch
    return this.getCorrections();
  }

  // Legacy compatibility
  async getProductCorrections(): Promise<ProductDefinition[]> {
    return this.getCorrections();
  }
}

export const orderCorrectionService = new OrderCorrectionService();