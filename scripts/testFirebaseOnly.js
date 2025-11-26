#!/usr/bin/env node

/**
 * Test Firebase-Only Implementation
 * 
 * Tests the new Firebase-only orderCorrection system
 * without any static fallback data.
 */

const { getProductCorrections, refreshProductCorrections } = require('../utils/orderCorrection');

async function testFirebaseOnly() {
  console.log('🧪 Testing Firebase-Only Implementation');
  console.log('=====================================\n');
  
  let testsPassed = 0;
  let totalTests = 0;

  // Test 1: Basic Firebase Connection
  totalTests++;
  try {
    console.log('📡 Test 1: Firebase Connection...');
    const corrections = await getProductCorrections();
    
    if (corrections.length > 0) {
      console.log(`✅ Connected! Found ${corrections.length} products`);
      testsPassed++;
    } else {
      console.log('❌ Connected but no products found');
    }
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
  }

  // Test 2: Refresh Functionality
  totalTests++;
  try {
    console.log('\n🔄 Test 2: Refresh Functionality...');
    await refreshProductCorrections();
    const refreshedCorrections = await getProductCorrections();
    
    if (refreshedCorrections.length > 0) {
      console.log(`✅ Refresh works! Found ${refreshedCorrections.length} products`);
      testsPassed++;
    } else {
      console.log('❌ Refresh failed - no products after refresh');
    }
  } catch (error) {
    console.log(`❌ Refresh failed: ${error.message}`);
  }

  // Test 3: Product Correction Function
  totalTests++;
  try {
    console.log('\n🔧 Test 3: Product Correction Function...');
    const testInput = 'şokolad - 2kq\ntiramisu - 5ədəd\nbrowni - 3box';
    const corrected = await correctOrderText(testInput);
    
    if (corrected && corrected.includes('Şokolad') && corrected.includes('Tiramisu') && corrected.includes('Brownie')) {
      console.log('✅ Correction works!');
      console.log(`   Input: ${testInput}`);
      console.log(`   Output: ${corrected}`);
      testsPassed++;
    } else {
      console.log('❌ Correction failed - unexpected output');
      console.log(`   Output: ${corrected}`);
    }
  } catch (error) {
    console.log(`❌ Correction failed: ${error.message}`);
  }

  // Test 4: Error Handling
  totalTests++;
  try {
    console.log('\n🛡️ Test 4: Error Handling...');
    
    // Test with invalid input
    const invalidInput = 'nonexistentproduct - 1';
    const corrected = await correctOrderText(invalidInput);
    
    // Should return empty or minimal output for invalid products
    if (corrected.trim().length === 0 || corrected.split('\n').length === 0) {
      console.log('✅ Error handling works - invalid products filtered out');
      testsPassed++;
    } else {
      console.log('⚠️  Error handling may need improvement - invalid products not filtered');
      console.log(`   Output: ${corrected}`);
    }
  } catch (error) {
    console.log(`❌ Error handling failed: ${error.message}`);
  }

  // Test 5: Performance
  totalTests++;
  try {
    console.log('\n⚡ Test 5: Performance...');
    const startTime = Date.now();
    
    // Run multiple corrections
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(correctOrderText('şokolad - 1kq'));
    }
    
    await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (duration < 2000) { // Should complete within 2 seconds
      console.log(`✅ Performance good! 3 corrections in ${duration}ms`);
      testsPassed++;
    } else {
      console.log(`⚠️  Performance may need optimization: ${duration}ms`);
    }
  } catch (error) {
    console.log(`❌ Performance test failed: ${error.message}`);
  }

  // Results
  console.log('\n📊 Test Results');
  console.log('==================');
  console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`Success Rate: ${Math.round((testsPassed / totalTests) * 100)}%`);
  
  if (testsPassed === totalTests) {
    console.log('\n🎉 All tests passed! Firebase-only implementation is working perfectly.');
    console.log('✅ No static fallback data needed');
    console.log('✅ Refresh functionality working');
    console.log('✅ Error handling working');
    console.log('✅ Performance acceptable');
    console.log('\n🚀 System is ready for production!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
    console.log('🔧 System may need adjustments before production.');
  }

  return testsPassed === totalTests;
}

// Run tests
if (require.main === module) {
  testFirebaseOnly()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test suite crashed:', error);
      process.exit(1);
    });
}

module.exports = {
  testFirebaseOnly
};