# OrderCorrection Firebase Migration Implementation

## Overview
Bu doküman, `orderCorrection.ts` dosyasındaki statik məhsul düzəliş məlumatlarının Firebase kolleksiyasına köçürülməsi üçün implementasiya planını təsvir edir.

## Current Structure Analysis

### Existing orderCorrection.ts
- **PRODUCT_CORRECTIONS**: 50+ məhsulun doğru yazılışları və variasiyaları
- **ProductDefinition interface**: correct, variations, units (optional)
- **Funksiyalar**: correctOrderText, normalizeText, findBestMatch, parseQuantity

### Affected Files
1. **OrderForm.tsx**: `correctOrderText` funksiyasını istifadə edir
2. **EditModal.tsx**: `PRODUCT_CORRECTIONS` array'indən məhsul siyahısı göstərir
3. **OrderCorrection.tsx**: `correctOrderText` funksiyasını istifadə edir
4. **products_list.tsx**: `PRODUCT_CORRECTIONS` array'ində məhsul siyahısı göstərir
5. **manage-custom-share.tsx**: `PRODUCT_CORRECTIONS` array'indən məhsul siyahısı alır
6. **new_orders.tsx**: `correctOrderText` funksiyasını istifadə edir

## Firebase Collection Design

### Collection Structure
```
productCorrections/
├── [productId]/
│   ├── correct: "Şokolad"
│   ├── variations: ["sokolad", "şokolad", "shokolad", ...]
│   ├── units: {
│   │   type: "weight" | "piece" | "box"
│   │   variations: ["kq", "kg", "kilo", "kiloqram"]
│   │ }
│   ├── isActive: true
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
```

### Index Requirements
```javascript
// Composite indexes for optimal performance
productCorrections.isActive (ascending)
productCorrections.correct (ascending)
productCorrections.updatedAt (descending)
```

## Implementation Steps

### Phase 1: Firebase Service Functions

#### 1.1 New Firebase Functions (utils/firebase.ts)
```typescript
// Product Correction interfaces
interface ProductDefinition {
  id?: string;
  correct: string;
  variations: string[];
  units?: {
    type: 'weight' | 'piece' | 'box';
    variations: string[];
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Get all active product corrections
export async function getProductCorrections(): Promise<ProductDefinition[]> {
  const cacheKey = 'product_corrections';
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const correctionsRef = collection(db, 'productCorrections');
    const q = query(correctionsRef, where('isActive', '==', true), orderBy('correct', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const corrections = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ProductDefinition[];
    
    setCache(cacheKey, corrections);
    return corrections;
  } catch (error) {
    console.error('Error getting product corrections:', error);
    return [];
  }
}

// Add new product correction
export async function addProductCorrection(correction: Omit<ProductDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const correctionsRef = collection(db, 'productCorrections');
    const docRef = await addDoc(correctionsRef, {
      ...correction,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    clearCache();
    return docRef.id;
  } catch (error) {
    console.error('Error adding product correction:', error);
    throw error;
  }
}

// Update product correction
export async function updateProductCorrection(id: string, updates: Partial<ProductDefinition>): Promise<void> {
  try {
    const correctionRef = doc(db, 'productCorrections', id);
    await updateDoc(correctionRef, {
      ...updates,
      updatedAt: new Date()
    });
    
    clearCache();
  } catch (error) {
    console.error('Error updating product correction:', error);
    throw error;
  }
}

// Delete product correction (soft delete)
export async function deleteProductCorrection(id: string): Promise<void> {
  try {
    const correctionRef = doc(db, 'productCorrections', id);
    await updateDoc(correctionRef, {
      isActive: false,
      updatedAt: new Date()
    });
    
    clearCache();
  } catch (error) {
    console.error('Error deleting product correction:', error);
    throw error;
  }
}
```

### Phase 2: New Service Layer

#### 2.1 Create services/orderCorrectionService.ts
```typescript
import { getProductCorrections } from '@/utils/firebase';
import { ProductDefinition } from '@/utils/firebase';

class OrderCorrectionService {
  private corrections: ProductDefinition[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getCorrections(): Promise<ProductDefinition[]> {
    const now = Date.now();
    
    // Cache check
    if (this.corrections.length > 0 && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.corrections;
    }

    try {
      this.corrections = await getProductCorrections();
      this.lastFetch = now;
      return this.corrections;
    } catch (error) {
      console.error('Error fetching corrections:', error);
      // Return cached data if available
      return this.corrections;
    }
  }

  async refreshCorrections(): Promise<void> {
    this.lastFetch = 0; // Force refresh
    await this.getCorrections();
  }

  // Legacy compatibility
  async getProductCorrections(): Promise<ProductDefinition[]> {
    return this.getCorrections();
  }
}

export const orderCorrectionService = new OrderCorrectionService();
```

### Phase 3: Updated orderCorrection.ts

#### 3.1 Refactored utils/orderCorrection.ts
```typescript
import { orderCorrectionService } from '@/services/orderCorrectionService';

// Legacy interface for backward compatibility
interface ProductDefinition {
  correct: string;
  variations: string[];
  units?: {
    type: 'weight' | 'piece' | 'box';
    variations: string[];
  };
}

// Legacy export for backward compatibility
export const PRODUCT_CORRECTIONS: ProductDefinition[] = [];

// Get corrections from service
export async function getProductCorrections(): Promise<ProductDefinition[]> {
  try {
    const corrections = await orderCorrectionService.getProductCorrections();
    return corrections.map(({ correct, variations, units }) => ({
      correct,
      variations,
      units
    }));
  } catch (error) {
    console.error('Error getting product corrections:', error);
    return [];
  }
}

// Initialize corrections on import
let correctionsInitialized = false;
async function initializeCorrections() {
  if (!correctionsInitialized) {
    const corrections = await getProductCorrections();
    PRODUCT_CORRECTIONS.push(...corrections);
    correctionsInitialized = true;
  }
}

// Auto-initialize
initializeCorrections();

// Rest of the functions remain the same...
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function findBestMatch(input: string, variations: string[]): Promise<string | null> {
  const normalizedInput = normalizeText(input);

  // Try exact match first
  const exactMatch = variations.find(v => normalizeText(v) === normalizedInput);
  if (exactMatch) return exactMatch;

  // Try contains match
  const containsMatch = variations.find(v => {
    const normalizedVariation = normalizeText(v);
    return normalizedInput.includes(normalizedVariation) ||
      normalizedVariation.includes(normalizedInput);
  });
  if (containsMatch) return containsMatch;

  // Try fuzzy match
  const fuzzyMatch = variations.find(v => {
    const normalizedVariation = normalizeText(v);
    let diffCount = 0;
    const shorter = normalizedInput.length < normalizedVariation.length ? normalizedInput : normalizedVariation;
    const longer = normalizedInput.length < normalizedVariation.length ? normalizedVariation : normalizedInput;

    for (let i = 0; i < shorter.length; i++) {
      if (shorter[i] !== longer[i]) diffCount++;
    }

    return diffCount <= 2 && Math.abs(normalizedInput.length - normalizedVariation.length) <= 2;
  });

  return fuzzyMatch || null;
}

function parseQuantity(quantity: string): { value: number; unit: string } {
  quantity = quantity.toLowerCase().trim();
  let value = 0;
  let unit = 'əd';

  const numMatch = quantity.match(/[\d.,]+/);
  if (numMatch) {
    value = parseFloat(numMatch[0].replace(',', '.'));
  }

  if (quantity.includes('kq') || quantity.includes('kg')) {
    unit = 'kq';
  } else if (quantity.match(/(box|qutu)/i)) {
    unit = 'box';
  }

  return { value, unit };
}

export async function correctOrderText(inputText: string): Promise<string> {
  const corrections = await getProductCorrections();
  
  const lines = inputText
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^[○•\-\s]*/, ''));

  const orderItems = new Map<string, any>();

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.split(/[-–:]|\s{2,}/).map(part => part.trim());
    if (parts.length < 1) continue;

    const productPart = parts[0];
    const quantityPart = parts[parts.length - 1];

    let matchedProduct: ProductDefinition | undefined;

    for (const product of corrections) {
      const matchedVariation = await findBestMatch(productPart, [product.correct, ...product.variations]);
      if (matchedVariation) {
        matchedProduct = product;
        break;
      }
    }

    if (!matchedProduct) continue;

    const { value, unit } = parseQuantity(quantityPart);

    const existingItem = orderItems.get(matchedProduct.correct);
    if (existingItem) {
      if (existingItem.unit === unit) {
        existingItem.quantity += value;
      }
    } else {
      orderItems.set(matchedProduct.correct, {
        product: matchedProduct.correct,
        quantity: value,
        unit
      });
    }
  }

  const correctedLines = Array.from(orderItems.values())
    .map(item => `${item.product} - ${item.quantity}${item.unit === 'əd' ? '' : ' ' + item.unit}`);

  return correctedLines.join('\n');
}

// Synchronous version for backward compatibility
export function correctOrderTextSync(inputText: string): string {
  // Fallback to static data if service not ready
  if (PRODUCT_CORRECTIONS.length === 0) {
    console.warn('Product corrections not loaded, using fallback');
    return inputText;
  }

  // Original synchronous logic...
  const lines = inputText
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^[○•\-\s]*/, ''));

  const orderItems = new Map<string, any>();

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.split(/[-–:]|\s{2,}/).map(part => part.trim());
    if (parts.length < 1) continue;

    const productPart = parts[0];
    const quantityPart = parts[parts.length - 1];

    let matchedProduct: ProductDefinition | undefined;

    for (const product of PRODUCT_CORRECTIONS) {
      const matchedVariation = findBestMatch(productPart, [product.correct, ...product.variations]);
      if (matchedVariation) {
        matchedProduct = product;
        break;
      }
    }

    if (!matchedProduct) continue;

    const { value, unit } = parseQuantity(quantityPart);

    const existingItem = orderItems.get(matchedProduct.correct);
    if (existingItem) {
      if (existingItem.unit === unit) {
        existingItem.quantity += value;
      }
    } else {
      orderItems.set(matchedProduct.correct, {
        product: matchedProduct.correct,
        quantity: value,
        unit
      });
    }
  }

  const correctedLines = Array.from(orderItems.values())
    .map(item => `${item.product} - ${item.quantity}${item.unit === 'əd' ? '' : ' ' + item.unit}`);

  return correctedLines.join('\n');
}
```

### Phase 4: File Updates

#### 4.1 OrderForm.tsx Changes
```typescript
// Before: import { correctOrderText } from '@/utils/orderCorrection';
// After: 
import { correctOrderText } from '@/utils/orderCorrection';

// Update handleSave function
const handleSave = async () => {
  if (!orderText.trim() || !selectedBranch) return;
  
  try {
    setIsSaving(true);
    const corrected = await correctOrderText(orderText); // Make it async
    // ... rest of the function
  } catch (error) {
    console.error('Error correcting order text:', error);
    Alert.alert('Xəta!', 'Məhsul düzəlişi zamanı xəta baş verdi');
  }
};
```

#### 4.2 EditModal.tsx Changes
```typescript
// Before: import { PRODUCT_CORRECTIONS } from '@/utils/orderCorrection';
// After:
import { getProductCorrections } from '@/utils/orderCorrection';

// Add state for products
const [products, setProducts] = useState<string[]>([]);

// Load products on mount
useEffect(() => {
  const loadProducts = async () => {
    const corrections = await getProductCorrections();
    setProducts(corrections.map(p => p.correct));
  };
  loadProducts();
}, []);

// Update Picker
<Picker
  selectedValue={productName}
  onValueChange={(itemValue: string) => setProductName(itemValue)}
  style={{ color: isDark ? '#FFF' : '#000' }}
>
  <Picker.Item label="Məhsul seçin" value="" />
  {products.map((product) => (
    <Picker.Item key={product} label={product} value={product} />
  ))}
</Picker>
```

#### 4.3 Similar updates for other files:
- OrderCorrection.tsx: Make correctOrderText async
- products_list.tsx: Load products from service
- manage-custom-share.tsx: Load products from service  
- new_orders.tsx: Make correctOrderText async

### Phase 5: Data Migration Script

#### 5.1 Migration Script (scripts/migrateProductCorrections.js)
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { PRODUCT_CORRECTIONS } from '../utils/orderCorrection';

const firebaseConfig = {
  // Your config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateProductCorrections() {
  console.log('Starting migration...');
  
  for (const product of PRODUCT_CORRECTIONS) {
    try {
      await addDoc(collection(db, 'productCorrections'), {
        correct: product.correct,
        variations: product.variations,
        units: product.units || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Migrated: ${product.correct}`);
    } catch (error) {
      console.error(`Error migrating ${product.correct}:`, error);
    }
  }
  
  console.log('Migration completed!');
}

migrateProductCorrections();
```

## Benefits of Migration

### 1. **Dynamic Updates**
- Yeni məhsulları əlavə etmək üçün app update lazım deyil
- Var olan məhsulları redaktə etmək mümkün
- Real-time data sync

### 2. **Performance**
- Firebase caching ilə daha yaxşı performance
- Lazy loading
- Optimized queries

### 3. **Scalability**
- Sonsuz sayda məhsul əlavə edilə bilər
- Version control
- Backup and recovery

### 4. **Analytics**
- Məhsul düzəliş statistikası
- İstifadəçi patternləri
- Error tracking

## Rollback Plan

### If migration fails:
1. **Immediate rollback**: Revert to static orderCorrection.ts
2. **Data backup**: Keep original PRODUCT_CORRECTIONS array
3. **Feature flag**: Disable Firebase-based corrections
4. **Fallback mechanism**: Use sync version as fallback

### Rollback steps:
```typescript
// In utils/orderCorrection.ts
export const USE_FIREBASE_CORRECTIONS = false; // Feature flag

export async function correctOrderText(inputText: string): Promise<string> {
  if (!USE_FIREBASE_CORRECTIONS) {
    return correctOrderTextSync(inputText);
  }
  // Firebase logic
}
```

## Testing Strategy

### 1. **Unit Tests**
- Service layer functions
- Firebase integration
- Data transformation

### 2. **Integration Tests**
- End-to-end order correction
- Component behavior
- Error handling

### 3. **Performance Tests**
- Loading times
- Memory usage
- Network requests

### 4. **User Acceptance Tests**
- Real-world usage scenarios
- Edge cases
- Error scenarios

## Deployment Plan

### Phase 1: Backend Setup (1 day)
- Create Firebase collection
- Set up indexes
- Run migration script

### Phase 2: Service Layer (1 day)
- Implement service functions
- Add to utils/firebase.ts
- Create orderCorrectionService.ts

### Phase 3: Frontend Updates (2 days)
- Update all affected files
- Implement async/await patterns
- Add error handling

### Phase 4: Testing (1 day)
- Unit and integration tests
- Performance testing
- User acceptance testing

### Phase 5: Deployment (1 day)
- Feature flag deployment
- Monitor performance
- Gradual rollout

## Monitoring & Maintenance

### 1. **Performance Monitoring**
- API response times
- Cache hit rates
- Error rates

### 2. **Data Quality**
- Duplicate detection
- Validation checks
- Data consistency

### 3. **User Feedback**
- Correction accuracy
- Missing products
- Performance issues

## Security Considerations

### 1. **Access Control**
- Read-only access for most users
- Admin access for updates
- Audit logging

### 2. **Data Validation**
- Input sanitization
- Schema validation
- Rate limiting

### 3. **Backup Strategy**
- Regular backups
- Point-in-time recovery
- Disaster recovery plan

## Conclusion

Bu migration ilə orderCorrection sistemi daha dinamik, scalable və maintainable olacaq. Firebase integration sayəsində real-time updates, better performance və improved user experience təmin ediləcək.