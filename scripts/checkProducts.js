#!/usr/bin/env node

/**
 * Quick script to check available products and fix search issues
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs,
  query,
  where,
  orderBy
} = require('firebase/firestore');

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

async function checkProducts() {
  console.log('📋 Checking available products...');
  
  try {
    const correctionsRef = collection(db, 'productCorrections');
    const querySnapshot = await getDocs(correctionsRef);
    
    const corrections = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${corrections.length} products:`);
    
    // Look for products containing "Cheesecake"
    const cheesecakeProducts = corrections.filter(c => 
      c.correct.toLowerCase().includes('cheesecake')
    );
    
    console.log('\n🧪 Products containing "Cheesecake":');
    cheesecakeProducts.forEach(product => {
      console.log(`  - ${product.correct}`);
    });
    
    console.log('\n📝 All products:');
    corrections.forEach((product, index) => {
      console.log(`${(index + 1).toString().padStart(2, ' ')}. ${product.correct}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkProducts();