/**
 * Manual verification script for Sefaria API Service
 * 
 * This script can be used to manually test the API service functions
 * Run this in a browser console or Node.js environment with fetch available
 */

import { getText, getIndex } from './sefariaApi';

/**
 * Test the getText function with a simple Breslov text
 */
export async function testGetText() {
  console.log('Testing getText function...');
  
  try {
    // Test with a simple text reference from the documented Breslov texts
    const result = await getText('Sichot_HaRan.1');
    
    console.log('✅ getText test successful');
    console.log('Reference:', result.ref);
    console.log('Text preview:', result.text[0]?.substring(0, 100) + '...');
    console.log('Hebrew preview:', result.he[0]?.substring(0, 100) + '...');
    console.log('Has error:', !!result.error);
    
    return result;
  } catch (error) {
    console.error('❌ getText test failed:', error);
    throw error;
  }
}

/**
 * Test the getIndex function with a Breslov text
 */
export async function testGetIndex() {
  console.log('Testing getIndex function...');
  
  try {
    // Test with a Breslov text title
    const result = await getIndex('Sichot_HaRan');
    
    console.log('✅ getIndex test successful');
    console.log('Title:', result.title);
    console.log('Hebrew Title:', result.heTitle);
    console.log('Categories:', result.categories);
    console.log('Section Names:', result.sectionNames);
    console.log('Text Depth:', result.textDepth);
    console.log('Has error:', !!result.error);
    
    return result;
  } catch (error) {
    console.error('❌ getIndex test failed:', error);
    throw error;
  }
}

/**
 * Run all verification tests
 */
export async function runAllTests() {
  console.log('🚀 Starting Sefaria API Service verification...\n');
  
  try {
    await testGetText();
    console.log('');
    await testGetIndex();
    
    console.log('\n✅ All tests completed successfully!');
    console.log('The API service is working correctly according to the documented patterns.');
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
  }
}

// Export for manual testing
export default {
  testGetText,
  testGetIndex,
  runAllTests
};