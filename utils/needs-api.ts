import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  writeBatch,
  where
} from 'firebase/firestore';
import { db } from './firebase';

// Cache yönetimi için basit bir mekanizma
let cache: Record<string, any> = {};

export function clearCache() {
  cache = {};
}

export function setCache(key: string, data: any) {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
}

export function getCache(key: string, maxAge = 5 * 60 * 1000) {
  const cached = cache[key];
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > maxAge) {
    delete cache[key];
    return null;
  }
  
  return cached.data;
}

export interface Need {
  id: string;
  name: string;
  price: string;
  unit: string;
  createdAt: number;
}

export interface DailyNeedOrder {
  name: string;
  price: string;
  quantity: string;
  totalPrice: string;
  unit: string;
  market: string;
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
    // Önce cache'e bakalım
    const cachedNeeds = getCache('needs');
    if (cachedNeeds) return cachedNeeds;
    
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
    console.log('saveDailyNeeds çağrıldı:', { date, needs });
    
    const dateStr = formatDate(date); // "DD.MM.YYYY" formatında
    console.log('Formatlanmış tarih:', dateStr);
    
    const needsRef = collection(db, 'needOrders', dateStr, 'needs_list');
    console.log('Koleksiyon referansı oluşturuldu');
    
    const batch = writeBatch(db);

    // Önce mevcut belgeleri silelim
    const existingDocs = await getDocs(needsRef);
    console.log('Mevcut belgeler alındı:', existingDocs.docs.length);
    
    existingDocs.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    console.log('Mevcut belgeler silme işlemine eklendi');

    // Yeni belgeleri ekleyelim
    needs.forEach((need, index) => {
      console.log(`Belge ${index + 1} ekleniyor:`, need);
      const needDoc = doc(needsRef);
      
      // Virgülleri noktalara çevir ve sayısal değerleri doğru formatta kaydet
      const price = need.price.replace(',', '.');
      const quantity = need.quantity.replace(',', '.');
      const totalPrice = need.totalPrice.replace(',', '.');
      
      batch.set(needDoc, {
        name: need.name,
        price: price,
        quantity: quantity,
        totalPrice: totalPrice,
        unit: need.unit,
        market: need.market || 'Diğer', // Market bilgisi yoksa "Diğer" olarak ayarla
        createdAt: Date.now()
      });
    });
    console.log('Tüm belgeler batch işlemine eklendi');

    console.log('Batch işlemi commit ediliyor...');
    await batch.commit();
    console.log('Batch işlemi başarıyla tamamlandı');
    
    clearCache();
    console.log('Cache temizlendi');
  } catch (error) {
    console.error('Error saving daily needs:', error);
    throw error;
  }
}

export async function getDailyNeeds(date: Date): Promise<DailyNeedOrder[]> {
  try {
    const dateStr = formatDate(date); // "DD.MM.YYYY" formatında
    const cacheKey = `dailyNeeds_${dateStr}`;
    
    // Önce cache'e bakalım
    const cachedNeeds = getCache(cacheKey);
    if (cachedNeeds) return cachedNeeds;
    
    const needsRef = collection(db, 'needOrders', dateStr, 'needs_list');
    const q = query(needsRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const dailyNeeds = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Sayısal değerleri string olarak formatla
      const price = typeof data.price === 'number' ? data.price.toFixed(2) : data.price;
      const quantity = typeof data.quantity === 'number' ? data.quantity.toFixed(2) : data.quantity;
      const totalPrice = typeof data.totalPrice === 'number' ? data.totalPrice.toFixed(2) : data.totalPrice;
      
      return {
        name: data.name,
        price: price,
        quantity: quantity,
        totalPrice: totalPrice,
        unit: data.unit,
        market: data.market || 'Diğer' // Market bilgisi yoksa "Diğer" olarak ayarla
      } as DailyNeedOrder;
    });
    
    setCache(cacheKey, dailyNeeds);
    return dailyNeeds;
  } catch (error) {
    console.error('Error getting daily needs:', error);
    return []; // Hata durumunda boş array dön
  }
}

// Günlük ihtiyaçlardan belirli bir öğeyi silme fonksiyonu
export const deleteDailyNeed = async (date: Date, needName: string, market: string): Promise<void> => {
  try {
    const formattedDate = formatDate(date);
    const needsRef = collection(db, 'needOrders', formattedDate, 'needs_list');
    
    // Belirli isim ve markete sahip belgeleri bul
    const q = query(
      needsRef,
      where('name', '==', needName),
      where('market', '==', market)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Batch işlemi başlat
    const batch = writeBatch(db);
    
    // Bulunan belgeleri sil
    querySnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Batch işlemini uygula
    await batch.commit();
    
    // Cache'i temizle
    clearCache();
    
    console.log(`"${needName}" ürünü "${market}" marketinden silindi`);
  } catch (error) {
    console.error('Günlük ihtiyaç silinirken hata:', error);
    throw error;
  }
}; 