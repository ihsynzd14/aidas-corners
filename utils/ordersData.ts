import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { formatDate } from './firebase';

export async function fetchOrdersByDate(date: Date) {
  const db = getFirestore();
  const formattedDate = formatDate(date);
  
  try {
    console.log('Fetching orders for date:', formattedDate);
    
    const dateDocRef = doc(db, 'orders', formattedDate);
    const branchesRef = collection(dateDocRef, 'branches');
    const branchesSnapshot = await getDocs(branchesRef);
    
    const ordersData: { [key: string]: any } = {};
    branchesSnapshot.docs.forEach(branchDoc => {
      ordersData[branchDoc.id] = branchDoc.data();
    });
    
    return ordersData;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}