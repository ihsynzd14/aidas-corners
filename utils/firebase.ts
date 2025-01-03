import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
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
const db = getFirestore(app);

export async function getBranches(): Promise<Branch[]> {
  const branchesCollection = collection(db, 'branchs');
  const snapshot = await getDocs(branchesCollection);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Branch));
}

export async function addOrder(order: OrderItem): Promise<void> {
  try {
    const date = new Date();
    const formattedDate = formatDate(date);
    
    // Reference to the date document in orders collection
    const dateDocRef = doc(db, 'orders', formattedDate);
    
    // Reference to the branch document in branches subcollection
    const branchDocRef = doc(collection(dateDocRef, 'branches'), order.branch);
    
    // Set the product directly as a field in the branch document
    await setDoc(branchDocRef, {
      [order.product]: order.quantity
    }, { merge: true }); // Use merge to preserve existing products
    
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`; // Changed to use dots instead of slashes
}