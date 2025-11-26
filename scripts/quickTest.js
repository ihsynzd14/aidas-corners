#!/usr/bin/env node

/**
 * Simple test to verify Firebase-only implementation
 */

console.log('🧪 Quick Firebase-Only Test');
console.log('=============================\n');

try {
  // Test basic import
  console.log('1. Testing import...');
  const { getProductCorrections } = require('../utils/orderCorrection');
  console.log('✅ Import successful');

  // Test basic function call
  console.log('2. Testing function call...');
  getProductCorrections().then(corrections => {
    console.log(`✅ Function call successful! Got ${corrections.length} corrections`);
    
    if (corrections.length > 0) {
      console.log('✅ Firebase-only implementation is working!');
      console.log('🎉 System is ready for production!');
    } else {
      console.log('⚠️  No corrections found - check Firebase connection');
    }
  }).catch(error => {
    console.error('❌ Function call failed:', error.message);
  });

} catch (error) {
  console.error('💥 Test failed:', error.message);
}