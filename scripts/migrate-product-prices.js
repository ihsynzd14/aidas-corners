const XLSX = require('xlsx');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, writeBatch } = require('firebase/firestore');

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

// Read the Excel file
const filePath = path.join(__dirname, '..', 'aidacorners_a_2025 giymet.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log('Excel data loaded:', data.length, 'products');

// Create a map of product names to prices (case-insensitive)
const priceMap = new Map();
data.forEach(row => {
  const productName = row['Adı'];
  const price = row['Qiyməti'];
  if (productName && price !== undefined && price !== null) {
    // Store both original and lowercase versions for better matching
    priceMap.set(productName.trim().toLowerCase(), parseFloat(price));
  }
});

console.log('Price map created with', priceMap.size, 'entries');
console.log('\nSample prices from Excel:');
let count = 0;
for (const [name, price] of priceMap.entries()) {
  if (count++ < 10) {
    console.log(`  ${name}: ${price} AZN`);
  }
}

// Migrate prices to Firebase
async function migratePrices() {
  try {
    console.log('\nFetching products from Firebase...');
    const correctionsRef = collection(db, 'productCorrections');
    const querySnapshot = await getDocs(correctionsRef);

    console.log('Found', querySnapshot.size, 'products in Firebase');

    const batch = writeBatch(db);
    let updatedCount = 0;
    let notFoundCount = 0;
    const notFoundProducts = [];

    querySnapshot.forEach((docSnapshot) => {
      const product = docSnapshot.data();
      const productName = product.correct;

      // Try to find price by matching product name (case-insensitive)
      const price = priceMap.get(productName.trim().toLowerCase());

      if (price !== undefined) {
        const productRef = doc(db, 'productCorrections', docSnapshot.id);
        batch.update(productRef, { price: price });
        updatedCount++;
        console.log(`✓ Matched: "${productName}" -> ${price} AZN`);
      } else {
        notFoundCount++;
        notFoundProducts.push(productName);
        console.log(`✗ Not found in Excel: "${productName}"`);
      }
    });

    console.log('\n=== Summary ===');
    console.log(`Products with prices updated: ${updatedCount}`);
    console.log(`Products not found in Excel: ${notFoundCount}`);

    if (notFoundCount > 0) {
      console.log('\nProducts without price data:');
      notFoundProducts.forEach(name => console.log(`  - ${name}`));
    }

    if (updatedCount > 0) {
      console.log('\nCommitting batch update to Firebase...');
      await batch.commit();
      console.log('✓ Migration completed successfully!');
    } else {
      console.log('\n⚠ No products were updated. Please check the product name matching.');
    }

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Run the migration
migratePrices()
  .then(() => {
    console.log('\nMigration script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration failed:', error);
    process.exit(1);
  });
