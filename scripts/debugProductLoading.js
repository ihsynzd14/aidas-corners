#!/usr/bin/env node

/**
 * Test script to debug product corrections loading
 */

const { getProductCorrections } = require('../utils/orderCorrection.ts');

async function testProductLoading() {
  console.log('🧪 Testing Product Corrections Loading...');
  console.log('==========================================\n');
  
  try {
    console.log('1. Calling getProductCorrections()...');
    const corrections = await getProductCorrections();
    
    console.log(`2. Received ${corrections.length} corrections`);
    
    if (corrections.length > 0) {
      console.log('3. Sample corrections:');
      corrections.slice(0, 3).forEach((correction, index) => {
        console.log(`   ${index + 1}. ${correction.correct} (${correction.variations.length} variations)`);
      });
      
      console.log('\n✅ Product corrections loading successfully!');
      console.log('✅ Firebase integration is working');
    } else {
      console.log('❌ No corrections received');
      console.log('❌ This might indicate a Firebase connection issue');
    }
    
  } catch (error) {
    console.error('❌ Error loading product corrections:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

testProductLoading();