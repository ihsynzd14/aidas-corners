import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Branch } from '@/types/branch';

// Your Firebase configuration
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