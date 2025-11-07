/**
 * This script updates product names in the Firebase database from 
 * variations of "Dubai bardaq" to "Dubai supangele".
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  writeBatch,
  deleteField
} = require('firebase/firestore');

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

// Format date as DD.MM.YYYY
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

// List of old product names that need to be changed
const oldProductNames = [
  "Dubai bardak",
  "Dubai bardaq",
  "Dubay bardaq",
  "Dubay bardak",
  "Dubai stəkan", 
  "Dubay stəkan", 
  "Dubai stekan", 
  "Dubay stekan"
];

// New product name to replace old ones
const newProductName = "Dubai supangele";

/**
 * Updates product names in Firebase database for a specific date range
 */
async function updateProductNames(startDate, endDate) {
  console.log(`Starting product name update from ${formatDate(startDate)} to ${formatDate(endDate)}`);
  
  // Generate array of dates to scan
  const dates = getDatesInRange(startDate, endDate);
  let totalUpdates = 0;
  
  for (const dateStr of dates) {
    console.log(`Processing date: ${dateStr}`);
    
    try {
      // Get all branches for this date
      const dateDocRef = doc(db, 'orders', dateStr);
      const branchesCollection = collection(dateDocRef, 'branches');
      const branchesSnapshot = await getDocs(branchesCollection);
      
      if (branchesSnapshot.empty) {
        console.log(`No branches found for date ${dateStr}`);
        continue;
      }
      
      // Loop through each branch
      for (const branchDoc of branchesSnapshot.docs) {
        const branchName = branchDoc.id;
        const branchData = branchDoc.data();
        let branchUpdated = false;
        
        // Create a batch for this branch's updates
        const batch = writeBatch(db);
        const branchRef = doc(collection(dateDocRef, 'branches'), branchName);
        
        // Check if any old product names exist in this branch
        for (const oldName of oldProductNames) {
          if (oldName in branchData) {
            console.log(`Found "${oldName}" in branch "${branchName}" on ${dateStr}`);
            
            // Get the quantity
            const quantity = branchData[oldName];
            
            // Prepare update: remove old field and add new one
            batch.update(branchRef, {
              [oldName]: deleteField(),
              [newProductName]: quantity
            });
            
            branchUpdated = true;
            totalUpdates++;
          }
        }
        
        // Commit batch if there were any updates
        if (branchUpdated) {
          await batch.commit();
          console.log(`Updated branch "${branchName}" on ${dateStr}`);
        }
      }
    } catch (error) {
      console.error(`Error processing date ${dateStr}:`, error);
    }
  }
  
  console.log(`Product name update completed. Total updates: ${totalUpdates}`);
}

/**
 * Gets all dates within a range as formatted strings
 */
function getDatesInRange(start, end) {
  const dates = [];
  const current = new Date(start);
  const endDate = new Date(end);
  
  while (current <= endDate) {
    dates.push(formatDate(new Date(current)));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// Parse command line arguments
function parseArgs() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  // Default: last 30 days
  let startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  let endDate = new Date();
  
  // Check if specific dates provided
  if (args.length >= 2) {
    try {
      // Format expected: YYYY-MM-DD
      startDate = new Date(args[0]);
      endDate = new Date(args[1]);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch (error) {
      console.error('Error parsing dates. Please use YYYY-MM-DD format.');
      console.error('Example: node scripts/update-product-names.js 2023-01-01 2023-01-31');
      process.exit(1);
    }
  }
  
  return { startDate, endDate };
}

// Main execution
const { startDate, endDate } = parseArgs();
console.log(`Running update for dates: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

updateProductNames(startDate, endDate)
  .then(() => console.log('Script execution completed'))
  .catch(error => console.error('Script execution failed:', error))
  .finally(() => process.exit()); 