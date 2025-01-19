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
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { Branch } from '@/types/branch';

interface OrderItem {
  branch: string;
  product: string;
  quantity: string;
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
const db = getFirestore(app);

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

export async function addOrder(order: OrderItem): Promise<void> {
  try {
    const formattedDate = formatDate(new Date());
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

export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};