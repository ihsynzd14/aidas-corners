import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  deleteField,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  addDoc,
  Timestamp,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { Branch } from '@/types/branch';

interface OrderItem {
  branch: string;
  product: string;
  quantity: string;
}

interface Need {
  id: string;
  name: string;
  price: string;
  unit: string;
  createdAt: number;
}

interface DailyNeedOrder {
  name: string;
  price: string;
  quantity: string;
  totalPrice: string;
  unit: string;
}

// Price history entry - her qiymət dəyişikliyi üçün bir giriş
export interface PriceHistoryEntry {
  price: number;
  effectiveFrom: Date;
}

// Product Correction interfaces
export interface ProductDefinition {
  id?: string;
  correct: string;
  variations: string[];
  units?: {
    type: 'weight' | 'piece' | 'box';
    variations: string[];
  };
  price?: number;
  priceHistory?: PriceHistoryEntry[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Verilən tarix üçün effektiv qiyməti tapır.
 * priceHistory massivini effectiveFrom-a görə sıralayır və verilən tarixdə
 * və ya ondan əvvəl olan ən son girişi qaytarır.
 * Heç bir uyğun giriş tapılmazsa undefined qaytarır.
 */
export function getEffectivePrice(priceHistory: PriceHistoryEntry[] | undefined, date: Date): number | undefined {
  if (!priceHistory || priceHistory.length === 0) return undefined;

  // effectiveFrom-a görə azalan sıralama (ən yeni əvvəlcə)
  const sorted = [...priceHistory].sort((a, b) => {
    const dateA = a.effectiveFrom instanceof Date ? a.effectiveFrom : new Date(a.effectiveFrom);
    const dateB = b.effectiveFrom instanceof Date ? b.effectiveFrom : new Date(b.effectiveFrom);
    return dateB.getTime() - dateA.getTime();
  });

  // Tarixdən əvvəl və ya ona bərabər olan ilk girişi tap
  const targetTime = date.getTime();
  for (const entry of sorted) {
    const entryDate = entry.effectiveFrom instanceof Date ? entry.effectiveFrom : new Date(entry.effectiveFrom);
    if (entryDate.getTime() <= targetTime) {
      return entry.price;
    }
  }

  // Heç bir giriş verilən tarixdən əvvəl deyilsə, ən erkən qiyməti qaytar
  // (yəni bütün tarix tarixçası verilən tarixdən sonradır — köhnə sifarişlər üçün ilk qiyməti istifadə et)
  return sorted[sorted.length - 1].price;
}

/**
 * Məhsullar siyahısından qiymət tarixçəsi xəritəsi yaradır.
 * Açar: məhsul adı (kiçik hərflə), Dəyər: PriceHistoryEntry[]
 * Həm correct adı, həm də bütün variations-ı xəritəyə əlavə edir.
 */
export function buildPriceHistoryMap(products: ProductDefinition[]): Map<string, PriceHistoryEntry[]> {
  const map = new Map<string, PriceHistoryEntry[]>();
  products.forEach(product => {
    if (product.priceHistory && product.priceHistory.length > 0) {
      map.set(product.correct.toLowerCase(), product.priceHistory);
      product.variations.forEach(variation => {
        if (variation) {
          map.set(variation.toLowerCase(), product.priceHistory!);
        }
      });
    } else if (product.price !== undefined) {
      // Fallback: priceHistory yoxdursa, cari qiymətdən bir giriş yarat
      const fallbackHistory: PriceHistoryEntry[] = [{
        price: product.price,
        effectiveFrom: product.createdAt || new Date('2024-01-01')
      }];
      map.set(product.correct.toLowerCase(), fallbackHistory);
      product.variations.forEach(variation => {
        if (variation) {
          map.set(variation.toLowerCase(), fallbackHistory);
        }
      });
    }
  });
  return map;
}

/**
 * DD.MM.YYYY formatındakı tarix sətirini Date obyektinə çevirir.
 */
export function parseDateString(dateStr: string): Date {
  const [day, month, year] = dateStr.split('.').map(Number);
  return new Date(year, month - 1, day);
}

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQ6wElMS4yPTNli18cWaPLPFwqo9gfLbU",
    authDomain: "aidascorner-71243.firebaseapp.com",
    projectId: "aidascorner-71243",
    storageBucket: "aidascorner-71243.firebasestorage.app",
    messagingSenderId: "827451742805",
    appId: "1:827451742805:web:1cf778cbc185a5f47a12dc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Basit getFirestore kullanımı
export const db = getFirestore(app);

// Memory cache için daha güvenilir bir yapı
const cache = new Map<string, CacheItem>();

interface CacheItem {
  data: any;
  timestamp: number;
}

// Cache süresini artıralım (örneğin 15 dakika)
const CACHE_EXPIRY = 15 * 60 * 1000;

export function setCache(key: string, data: any) {
  if (!data) return; // Boş data'yı cache'leme
  
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export function getCache(key: string): any | null {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() - item.timestamp > CACHE_EXPIRY) {
    cache.delete(key);
    return null;
  }
  
  return item.data;
}

// Cache temizleme fonksiyonu
export function clearCache() {
  cache.clear();
}

// Optimize edilmiş veri çekme fonksiyonları
export async function getBranches(): Promise<Branch[]> {
  const cacheKey = 'branches';
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  const branchesCollection = collection(db, 'branchs');
  const snapshot = await getDocs(branchesCollection);
  const branches = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Branch));

  setCache(cacheKey, branches);
  return branches;
}

export async function addOrder(date: string, order: OrderItem): Promise<void> {
  try {
    const formattedDate = date;
    const dateDocRef = doc(db, 'orders', formattedDate);
    const branchDocRef = doc(collection(dateDocRef, 'branches'), order.branch);
    
    // Batch write kullan
    const batch = writeBatch(db);
    batch.set(branchDocRef, {
      [order.product]: order.quantity
    }, { merge: true });
    
    await batch.commit();
    
    // Cache'i temizle
    cache.clear();
  } catch (error) {
    console.error('Sipariş eklenirken hata:', error);
    throw error;
  }
}

// Toplu veri çekme yardımcı fonksiyonu
export async function fetchOrdersForDateRange(startDate: Date, endDate: Date): Promise<Map<string, any>> {
  const cacheKey = `orders_${formatDate(startDate)}_${formatDate(endDate)}`;
  const cachedData = getCache(cacheKey);
  
  if (cachedData) {
    console.log('Cache\'den veriler alındı:', cacheKey);
    return cachedData;
  }

  console.log('Firebase\'den veriler çekiliyor...');
  const result = new Map();
  const dates = getDatesInRange(startDate, endDate);
  
  try {
    // Batch halinde veri çekme (her seferinde 10 gün)
    const batchSize = 10;
    for (let i = 0; i < dates.length; i += batchSize) {
      const batchDates = dates.slice(i, i + batchSize);
      const batchPromises = batchDates.map(async (date) => {
        const ordersRef = collection(db, 'orders', date, 'branches');
        const snapshot = await getDocs(ordersRef);
        result.set(date, snapshot);
      });
      
      await Promise.all(batchPromises);
    }
    
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    throw error;
  }
}

// Tarih aralığı yardımcı fonksiyonu
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

// Optimize edilmiş silme işlemleri
export async function deleteBranchOrders(date: Date, branchName: string): Promise<void> {
  try {
    const formattedDate = formatDate(date);
    const dateDocRef = doc(db, 'orders', formattedDate);
    const branchDocRef = doc(collection(dateDocRef, 'branches'), branchName);
    
    const batch = writeBatch(db);
    batch.delete(branchDocRef);
    await batch.commit();
    
    cache.clear();
  } catch (error) {
    console.error('Şube siparişleri silinirken hata:', error);
    throw error;
  }
}

// Optimize edilmiş güncelleme işlemleri
export async function updateProduct(
  date: Date, 
  branchName: string, 
  oldProductName: string,
  newProductName: string,
  newQuantity: string
): Promise<void> {
  try {
    const formattedDate = formatDate(date);
    const dateDocRef = doc(db, 'orders', formattedDate);
    const branchDocRef = doc(collection(dateDocRef, 'branches'), branchName);
    
    const batch = writeBatch(db);
    
    if (oldProductName !== newProductName) {
      batch.update(branchDocRef, {
        [oldProductName]: deleteField(),
        [newProductName]: newQuantity
      });
    } else {
      batch.update(branchDocRef, {
        [oldProductName]: newQuantity
      });
    }
    
    await batch.commit();
    cache.clear();
  } catch (error) {
    console.error('Ürün güncellenirken hata:', error);
    throw error;
  }
}

export async function deleteProduct(date: Date, branchName: string, productName: string): Promise<void> {
  try {
    const formattedDate = formatDate(date);
    const dateDocRef = doc(db, 'orders', formattedDate);
    const branchDocRef = doc(collection(dateDocRef, 'branches'), branchName);
    
    await updateDoc(branchDocRef, {
      [productName]: deleteField()
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function addProductToBranch(
  date: Date,
  branchName: string,
  productName: string,
  quantity: string
): Promise<void> {
  try {
    const formattedDate = formatDate(date);
    const dateDocRef = doc(db, 'orders', formattedDate);
    const branchDocRef = doc(collection(dateDocRef, 'branches'), branchName);
    
    await updateDoc(branchDocRef, {
      [productName]: quantity
    });
  } catch (error) {
    console.error('Error adding product to branch:', error);
    throw error;
  }
}

// Needs koleksiyonu için fonksiyonlar
export async function addNeed(need: Omit<Need, 'id' | 'createdAt'>): Promise<void> {
  try {
    const needRef = doc(db, 'needs', need.name);
    await setDoc(needRef, {
      id: need.name,
      ...need,
      createdAt: Date.now()
    });
    
    // Cache'i temizle
    clearCache();
  } catch (error) {
    console.error('Error adding need:', error);
    throw error;
  }
}

export async function updateNeed(needId: string, updates: Partial<Omit<Need, 'id'>>): Promise<void> {
  try {
    const needRef = doc(db, 'needs', needId);
    await updateDoc(needRef, updates);
    clearCache();
  } catch (error) {
    console.error('Error updating need:', error);
    throw error;
  }
}

export async function deleteNeed(needId: string): Promise<void> {
  try {
    const needRef = doc(db, 'needs', needId);
    await deleteDoc(needRef);
    clearCache();
  } catch (error) {
    console.error('Error deleting need:', error);
    throw error;
  }
}

export async function getNeeds(): Promise<Need[]> {
  try {
    const needsRef = collection(db, 'needs');
    const q = query(needsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const needs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Need[];
    
    setCache('needs', needs);
    return needs;
  } catch (error) {
    console.error('Error getting needs:', error);
    throw error;
  }
}

export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export async function saveDailyNeeds(date: Date, needs: DailyNeedOrder[]): Promise<void> {
  try {
    const dateStr = formatDate(date); // "DD.MM.YYYY" formatında
    const needsRef = collection(db, 'needOrders', dateStr, 'needs_list');
    
    const batch = writeBatch(db);

    // Önce mevcut belgeleri silelim
    const existingDocs = await getDocs(needsRef);
    existingDocs.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Yeni belgeleri ekleyelim
    needs.forEach((need) => {
      const needDoc = doc(needsRef);
      batch.set(needDoc, {
        name: need.name,
        price: need.price,
        quantity: need.quantity,
        totalPrice: need.totalPrice,
        unit: need.unit,
        createdAt: Date.now()
      });
    });

    await batch.commit();
    clearCache();
  } catch (error) {
    console.error('Error saving daily needs:', error);
    throw error;
  }
}

export async function getDailyNeeds(date: Date): Promise<DailyNeedOrder[]> {
  try {
    const dateStr = formatDate(date); // "DD.MM.YYYY" formatında
    const needsRef = collection(db, 'needOrders', dateStr, 'needs_list');
    const q = query(needsRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        totalPrice: data.totalPrice,
        unit: data.unit
      } as DailyNeedOrder;
    });
  } catch (error) {
    console.error('Error getting daily needs:', error);
    return []; // Hata durumunda boş array dön
  }
}

// App version checking function
export async function checkAppVersion(): Promise<{
  needsUpdate: boolean, 
  apkUrl?: string, 
  latestVersion?: string,
  changelog?: string[]
}> {
  try {
    // Check cache first
    const cacheKey = 'app_version_check';
    const cachedData = getCache(cacheKey);
    if (cachedData) return cachedData;

    // Get current app version from app.json
    const appInfo = require('../app.json');
    const currentVersion = appInfo.expo.version;
    
    // Get latest version from Firebase
    const appVersionCollection = collection(db, 'app_version');
    const snapshot = await getDocs(appVersionCollection);
    
    if (snapshot.empty) {
      return { needsUpdate: false };
    }
    
    // Assuming there's only one document in the collection
    const versionDoc = snapshot.docs[0];
    const versionData = versionDoc.data();
    const latestVersion = versionData.apk_version;
    const apkUrl = versionData.apk_url;
    const changelog = versionData.changelog || [];
    
    // Compare versions using semantic versioning
    const needsUpdate = compareVersions(currentVersion, latestVersion);
    
    const result = { 
      needsUpdate, 
      apkUrl: needsUpdate ? apkUrl : undefined,
      latestVersion: needsUpdate ? latestVersion : undefined,
      changelog: needsUpdate ? changelog : undefined
    };
    
    // Cache the result
    setCache(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error checking app version:', error);
    return { needsUpdate: false };
  }
}

/**
 * Compares two version strings using semantic versioning rules
 * Returns true if remoteVersion is newer than localVersion
 * 
 * @param localVersion - The current app version
 * @param remoteVersion - The latest version from Firebase
 * @returns boolean - True if an update is needed
 */
function compareVersions(localVersion: string, remoteVersion: string): boolean {
  // Remove any non-numeric characters (like 'a' in '1.3.0a')
  const cleanLocalVersion = localVersion.replace(/[^0-9.]/g, '');
  const cleanRemoteVersion = remoteVersion.replace(/[^0-9.]/g, '');
  
  const localParts = cleanLocalVersion.split('.').map(Number);
  const remoteParts = cleanRemoteVersion.split('.').map(Number);
  
  // Compare each part of the version
  for (let i = 0; i < Math.max(localParts.length, remoteParts.length); i++) {
    // If a part doesn't exist, treat it as 0
    const localPart = i < localParts.length ? localParts[i] : 0;
    const remotePart = i < remoteParts.length ? remoteParts[i] : 0;
    
    if (remotePart > localPart) {
      return true; // Remote version is newer
    } else if (remotePart < localPart) {
      return false; // Local version is newer
    }
    // If parts are equal, continue to next part
  }
  
  // If we get here, versions are identical
  return false;
}

// ===== PRODUCT CORRECTION FUNCTIONS =====

/**
 * Firestore Timestamp-ı JS Date-ə çevirir.
 * Əgər artıq Date-dirsə və ya null/undefined-dirsə, uyğun şəkildə idarə edir.
 */
function toDate(value: any): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === 'object' && typeof value.toDate === 'function') return value.toDate();
  if (typeof value === 'string') return new Date(value);
  if (typeof value === 'number') return new Date(value);
  return undefined;
}

/**
 * Firestore-dan gələn xam priceHistory massivini düzgün PriceHistoryEntry[] formatına çevirir.
 */
function parsePriceHistory(raw: any[]): PriceHistoryEntry[] {
  return raw.map(entry => ({
    price: entry.price,
    effectiveFrom: toDate(entry.effectiveFrom) || new Date('2024-01-01')
  }));
}

// Get all active product corrections
export async function getProductCorrections(): Promise<ProductDefinition[]> {
  const cacheKey = 'product_corrections';
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const correctionsRef = collection(db, 'productCorrections');
    let corrections: ProductDefinition[] = [];

    // First try with index (will work once index is created)
    try {
      const q = query(correctionsRef, where('isActive', '==', true), orderBy('correct', 'asc'));
      const querySnapshot = await getDocs(q);
      
      corrections = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
          priceHistory: data.priceHistory ? parsePriceHistory(data.priceHistory) : undefined,
        } as ProductDefinition;
      });
    } catch (indexError: any) {
      // Fallback: Get all documents and filter client-side
      if (indexError.message && indexError.message.includes('requires an index')) {
        console.log('⚠️  Index not found, using client-side filtering...');
        const querySnapshot = await getDocs(correctionsRef);
        
        corrections = querySnapshot.docs
          .map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
              createdAt: toDate(data.createdAt),
              updatedAt: toDate(data.updatedAt),
              priceHistory: data.priceHistory ? parsePriceHistory(data.priceHistory) : undefined,
            } as ProductDefinition;
          })
          .filter(correction => correction.isActive === true)
          .sort((a, b) => a.correct.localeCompare(b.correct));
      } else {
        throw indexError;
      }
    }

    // Auto-migration: priceHistory olmayan məhsullar üçün priceHistory yaradılır
    const migrationPromises: Promise<void>[] = [];
    corrections.forEach(product => {
      if (product.price !== undefined && (!product.priceHistory || product.priceHistory.length === 0)) {
        const effectiveFrom = product.createdAt || new Date('2024-01-01');
        const priceHistory: PriceHistoryEntry[] = [{ price: product.price, effectiveFrom }];
        product.priceHistory = priceHistory;

        // Firestore-a yaz (background-da)
        if (product.id) {
          const correctionRef = doc(db, 'productCorrections', product.id);
          migrationPromises.push(
            updateDoc(correctionRef, { priceHistory }).catch(err => {
              console.warn(`priceHistory migration failed for ${product.correct}:`, err);
            })
          );
        }
      }
    });

    // Migration-ları background-da yerinə yetir (gözləmə olmadan)
    if (migrationPromises.length > 0) {
      console.log(`Migrating priceHistory for ${migrationPromises.length} products...`);
      Promise.all(migrationPromises).then(() => {
        console.log('priceHistory migration completed');
      }).catch(err => {
        console.warn('Some priceHistory migrations failed:', err);
      });
    }

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
    const now = new Date();

    // priceHistory-ni avtomatik yaradırıq əgər qiymət varsa
    const dataToSave: any = {
      ...correction,
      createdAt: now,
      updatedAt: now,
    };

    if (correction.price !== undefined && (!correction.priceHistory || correction.priceHistory.length === 0)) {
      dataToSave.priceHistory = [{ price: correction.price, effectiveFrom: now }];
    }

    const docRef = await addDoc(correctionsRef, dataToSave);
    
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
    
    // Create update object, filtering out undefined values
    const updateData: any = {
      updatedAt: new Date()
    };
    
    // Only include fields that are not undefined
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key];
      if (value !== undefined) {
        updateData[key] = value;
      }
    });
    
    console.log('Updating product with data:', updateData);
    await updateDoc(correctionRef, updateData);
    
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

// Get single product correction by ID
export async function getProductCorrection(id: string): Promise<ProductDefinition | null> {
  try {
    const correctionRef = doc(db, 'productCorrections', id);
    const docSnap = await getDocs(query(collection(correctionRef)));
    
    if (docSnap.empty) {
      return null;
    }
    
    return {
      id: docSnap.docs[0].id,
      ...docSnap.docs[0].data()
    } as ProductDefinition;
  } catch (error) {
    console.error('Error getting product correction:', error);
    return null;
  }
}

// Search product corrections by text
export async function searchProductCorrections(searchText: string): Promise<ProductDefinition[]> {
  try {
    const corrections = await getProductCorrections();
    const searchLower = searchText.toLowerCase();
    
    return corrections.filter(correction => 
      correction.correct.toLowerCase().includes(searchLower) ||
      correction.variations.some(v => v.toLowerCase().includes(searchLower))
    );
  } catch (error) {
    console.error('Error searching product corrections:', error);
    return [];
  }
}