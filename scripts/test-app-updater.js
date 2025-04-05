/**
 * Test script for AppUpdater
 * 
 * This script adds a test document to the app_version collection in Firebase
 * to simulate an available update for testing purposes.
 * 
 * Usage:
 * node scripts/test-app-updater.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc } = require('firebase/firestore');

// Firebase configuration (same as in utils/firebase.ts)
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

// Get the current app version from app.json
const fs = require('fs');
const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
const currentVersion = appJson.expo.version;

console.log(`Current app version from app.json: ${currentVersion}`);

// Document ID for the app version document
const APP_VERSION_DOC_ID = 'current';

// Sample changelog entries
const sampleChangelog = [
  "Yeni güncelleme xüsusiyyəti əlavə edildi",
  "Performans təkmilləşdirmələri edildi",
  "İnterfeys dizaynı yeniləndi",
  "Xətalar düzəldildi",
  "Yeni xüsusiyyətlər əlavə edildi"
];

// Function to check if the app_version collection and document already exist
async function checkExistingVersion() {
  try {
    const docRef = doc(db, 'app_version', APP_VERSION_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Existing version data in Firebase:');
      console.log(`- Version: ${data.apk_version}`);
      console.log(`- URL: ${data.apk_url}`);
      if (data.changelog && data.changelog.length > 0) {
        console.log('- Changelog:');
        data.changelog.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item}`);
        });
      } else {
        console.log('- No changelog found');
      }
      return data;
    } else {
      console.log('No existing version document found in Firebase.');
      return null;
    }
  } catch (error) {
    console.error('Error checking existing version:', error);
    return null;
  }
}

// Create a test version that's different from the current version
function getTestVersion(currentVersion) {
  // Parse the version parts
  const versionParts = currentVersion.replace(/[^0-9.]/g, '').split('.');
  
  // Increment the last part
  const lastPart = parseInt(versionParts[versionParts.length - 1] || 0);
  versionParts[versionParts.length - 1] = (lastPart + 1).toString();
  
  return versionParts.join('.');
}

// Generate a random subset of changelog entries
function getRandomChangelog() {
  // Return all changelog entries instead of a random subset
  return sampleChangelog; // This will ensure all entries are sent
}

// Add a test document to the app_version collection
async function addTestDocument() {
  try {
    // Check if there's an existing document
    const existingData = await checkExistingVersion();
    
    // Create a test version that's different from both the current app version
    // and any existing version in Firebase
    let testVersion;
    if (existingData && existingData.apk_version === currentVersion) {
      testVersion = getTestVersion(currentVersion);
    } else if (existingData) {
      // If the existing version is already different, use it
      console.log('Existing version is already different from app version. No changes needed.');
      return;
    } else {
      testVersion = getTestVersion(currentVersion);
    }
    
    // Generate a random changelog
    const changelog = getRandomChangelog();
    
    // Create a reference to the app_version collection
    const appVersionRef = doc(db, 'app_version', APP_VERSION_DOC_ID);
    
    // Set the document data
    await setDoc(appVersionRef, {
      apk_version: testVersion,
      apk_url: 'https://github.com/javiersantos/AppUpdater',
      changelog: changelog
    });
    
    console.log(`\nTest document added to app_version collection with version ${testVersion}`);
    console.log('APK URL set to: https://github.com/javiersantos/AppUpdater');
    console.log('\nChangelog:');
    changelog.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });
    
    console.log('\n✅ SUCCESS: You should now see the update prompt when you run the app');
    console.log('\nTo test:');
    console.log('1. Run your app with "npm start" or "expo start"');
    console.log('2. The update modal should appear automatically when the app loads');
    console.log('3. You should see the changelog items in the update modal');
  } catch (error) {
    console.error('Error adding test document:', error);
  }
}

// Run the function
addTestDocument(); 