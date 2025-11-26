#!/usr/bin/env node

/**
 * Test Script: Product Corrections Firebase Integration
 * 
 * This script tests the Firebase-based product correction system
 * to ensure it works correctly after migration.
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

// Test cases
const testCases = [
  {
    name: "Exact Match Test",
    input: "şokolad",
    expected: "Şokolad"
  },
  {
    name: "Variation Match Test", 
    input: "sokolad",
    expected: "Şokolad"
  },
  {
    name: "Fuzzy Match Test",
    input: "shokolad",
    expected: "Şokolad"
  },
  {
    name: "Complex Product Test",
    input: "tiramisu",
    expected: "Tiramisu"
  },
  {
    input: "browni",
    expected: "Brownie"
  },
  {
    name: "Order Text Processing Test",
    input: `şokolad - 2kq
tiramisu - 5ədəd
browni - 3box`,
    expectedContains: ["Şokolad - 2kq", "Tiramisu - 5ədəd", "Brownie - 3box"]
  }
];

async function testFirebaseConnection() {
  console.log('🔗 Testing Firebase connection...');
  
  try {
    const correctionsRef = collection(db, 'productCorrections');
    // Try without orderBy first to avoid index requirement
    const q = query(correctionsRef, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    
    console.log(`✅ Connected successfully! Found ${querySnapshot.size} active corrections`);
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    return false;
  }
}

async function testProductSearch() {
  console.log('\n🔍 Testing product search functionality...');
  
  try {
    const correctionsRef = collection(db, 'productCorrections');
    const q = query(correctionsRef, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    
    const corrections = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    let passedTests = 0;
    let totalTests = testCases.filter(tc => tc.expected).length;
    
    for (const testCase of testCases) {
      if (!testCase.expected) continue; // Skip complex tests for now
      
      const found = corrections.find(correction => 
        correction.correct.toLowerCase() === testCase.expected.toLowerCase() ||
        correction.variations.some(v => v.toLowerCase() === testCase.input.toLowerCase())
      );
      
      if (found) {
        console.log(`✅ ${testCase.name}: Found "${testCase.expected}" for input "${testCase.input}"`);
        passedTests++;
      } else {
        console.log(`❌ ${testCase.name}: Failed to find "${testCase.expected}" for input "${testCase.input}"`);
      }
    }
    
    console.log(`\n📊 Search Test Results: ${passedTests}/${totalTests} passed`);
    return passedTests === totalTests;
  } catch (error) {
    console.error('❌ Product search test failed:', error.message);
    return false;
  }
}

async function testDataIntegrity() {
  console.log('\n🔒 Testing data integrity...');
  
  try {
    const correctionsRef = collection(db, 'productCorrections');
    const querySnapshot = await getDocs(correctionsRef);
    
    const corrections = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    let issues = [];
    
    // Check for required fields
    corrections.forEach((correction, index) => {
      if (!correction.correct) {
        issues.push(`Product ${index + 1}: Missing 'correct' field`);
      }
      
      if (!correction.variations || !Array.isArray(correction.variations)) {
        issues.push(`Product ${index + 1}: Missing or invalid 'variations' field`);
      }
      
      if (correction.variations && correction.variations.length === 0) {
        issues.push(`Product ${index + 1}: Empty variations array`);
      }
      
      if (typeof correction.isActive !== 'boolean') {
        issues.push(`Product ${index + 1}: Missing or invalid 'isActive' field`);
      }
    });
    
    // Check for duplicates
    const correctNames = corrections.map(c => c.correct.toLowerCase());
    const duplicates = correctNames.filter((name, index) => correctNames.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      issues.push(`Duplicate product names found: ${duplicates.join(', ')}`);
    }
    
    if (issues.length === 0) {
      console.log(`✅ Data integrity check passed for ${corrections.length} products`);
      return true;
    } else {
      console.log('❌ Data integrity issues found:');
      issues.forEach(issue => console.log(`  - ${issue}`));
      return false;
    }
  } catch (error) {
    console.error('❌ Data integrity test failed:', error.message);
    return false;
  }
}

async function testPerformance() {
  console.log('\n⚡ Testing performance...');
  
  try {
    const startTime = Date.now();
    
    // Test multiple queries
    const promises = [];
    for (let i = 0; i < 5; i++) {
      const correctionsRef = collection(db, 'productCorrections');
      const q = query(correctionsRef, where('isActive', '==', true));
      promises.push(getDocs(q));
    }
    
    await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Performance test completed in ${duration}ms for 5 concurrent queries`);
    
    // Performance should be under 5 seconds for 5 queries
    return duration < 5000;
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    return false;
  }
}

async function testSampleProducts() {
  console.log('\n🧪 Testing sample products...');
  
  const sampleProducts = ['Şokolad', 'Tiramisu', 'Brownie', 'Cheesecake Caramel'];
  let foundCount = 0;
  
  try {
    for (const product of sampleProducts) {
      const correctionsRef = collection(db, 'productCorrections');
      const q = query(correctionsRef, where('correct', '==', product));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        console.log(`✅ Found ${product}: ${data.variations.length} variations, units: ${data.units ? data.units.type : 'none'}`);
        foundCount++;
      } else {
        console.log(`❌ Missing product: ${product}`);
      }
    }
    
    console.log(`\n📊 Sample Products Test: ${foundCount}/${sampleProducts.length} found`);
    return foundCount === sampleProducts.length;
  } catch (error) {
    console.error('❌ Sample products test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Product Corrections Firebase Integration Tests');
  console.log('===============================================\n');
  
  const tests = [
    { name: 'Firebase Connection', fn: testFirebaseConnection },
    { name: 'Product Search', fn: testProductSearch },
    { name: 'Data Integrity', fn: testDataIntegrity },
    { name: 'Performance', fn: testPerformance },
    { name: 'Sample Products', fn: testSampleProducts }
  ];
  
  let passedTests = 0;
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
      if (result) passedTests++;
    } catch (error) {
      console.error(`❌ ${test.name} test crashed:`, error.message);
      results.push({ name: test.name, passed: false, error: error.message });
    }
  }
  
  // Summary
  console.log('\n📋 Test Summary');
  console.log('================');
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });
  
  console.log(`\n🏆 Overall Result: ${passedTests}/${tests.length} tests passed`);
  
  if (passedTests === tests.length) {
    console.log('🎉 All tests passed! Firebase integration is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the issues above.');
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = {
  testFirebaseConnection,
  testProductSearch,
  testDataIntegrity,
  testPerformance,
  testSampleProducts
};