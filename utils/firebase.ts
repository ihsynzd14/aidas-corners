import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, updateDoc, deleteField } from 'firebase/firestore';
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

// New functions for order management
export async function deleteBranchOrders(date: Date, branchName: string): Promise<void> {
  try {
    const formattedDate = formatDate(date);
    const dateDocRef = doc(db, 'orders', formattedDate);
    const branchDocRef = doc(collection(dateDocRef, 'branches'), branchName);
    
    await deleteDoc(branchDocRef);
  } catch (error) {
    console.error('Error deleting branch orders:', error);
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
    
    // If product name changed, delete old field and add new one
    if (oldProductName !== newProductName) {
      await updateDoc(branchDocRef, {
        [oldProductName]: deleteField(),
        [newProductName]: newQuantity
      });
    } else {
      // If only quantity changed
      await updateDoc(branchDocRef, {
        [oldProductName]: newQuantity
      });
    }
  } catch (error) {
    console.error('Error updating product:', error);
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

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`; // Changed to use dots instead of slashes
}