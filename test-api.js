// Simple test to verify API endpoints work
const API_BASE_URL = 'http://localhost:3000';

async function testProductsAPI() {
  try {
    console.log('🧪 Testing Products API...');
    
    // Test GET all products
    const response = await fetch(`${API_BASE_URL}/api/products`);
    const result = await response.json();
    
    console.log('✅ Products API Response:', {
      status: response.status,
      dataCount: result.data?.length || 0,
      sampleProduct: result.data?.[0]?.name || 'No products'
    });
    
    // Test GET featured products
    const featuredResponse = await fetch(`${API_BASE_URL}/api/products?featured=true`);
    const featuredResult = await featuredResponse.json();
    
    console.log('✅ Featured Products:', {
      status: featuredResponse.status,
      dataCount: featuredResult.data?.length || 0
    });
    
    return true;
  } catch (error) {
    console.error('❌ API Test Error:', error);
    return false;
  }
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - add to window for manual testing
  window.testAPI = testProductsAPI;
  console.log('💡 Run window.testAPI() in browser console to test API');
} else {
  // Node environment - run immediately
  testProductsAPI();
}