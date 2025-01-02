import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, setDoc, doc } from 'firebase/firestore';
import { Branch } from '@/types/branch';

const firebaseConfig = {
    apiKey: "AIzaSyCQ6wElMS4yPTNli18cWaPLPFwqo9gfLbU",
    authDomain: "aidascorner-71243.firebaseapp.com",
    projectId: "aidascorner-71243",
    storageBucket: "aidascorner-71243.firebasestorage.app",
    messagingSenderId: "827451742805",
    appId: "1:827451742805:web:1cf778cbc185a5f47a12dc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getBranches(): Promise<Branch[]> {
  const branchesCollection = collection(db, 'branchs');
  const snapshot = await getDocs(branchesCollection);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Branch));
}

interface OrderItem {
  branch: string;
  product: string;
  quantity: string;
}

export async function addOrder(order: OrderItem): Promise<void> {
  try {
    // Get current date in dd/mm/yyyy format
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
    
    // Create references to nested collections
    const dateCollection = doc(db, 'orders', dateStr);
    const branchCollection = doc(dateCollection, 'branches', order.branch);
    
    // Create or update the product document
    await setDoc(branchCollection, {
      [order.product]: order.quantity
    }, { merge: true });

  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
}