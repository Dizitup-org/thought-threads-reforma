// Test script to verify RLS fix
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

// Simple .env parser
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        // Remove quotes if present
        const cleanValue = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
        process.env[key.trim()] = cleanValue;
      }
    }
  });
}

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://qzfoorsiawmtkwefprvl.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: VITE_SUPABASE_SERVICE_KEY environment variable is not set');
  process.exit(1);
}

console.log('Using Supabase URL:', SUPABASE_URL);

// Create admin client with full privileges
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
});

async function testRLSFix() {
  console.log('Testing RLS fix...');
  
  try {
    // Test 1: Try to insert a user record (this was likely failing before)
    console.log('\n--- Test 1: Inserting a test user record ---');
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser'
    };
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([testUser])
      .select();
    
    if (userError) {
      console.log('❌ User insert failed:', userError.message);
      console.log('This indicates RLS policies are still restrictive');
    } else {
      console.log('✅ User insert succeeded!');
      console.log('User data:', userData);
      
      // If insert succeeded, try to delete the test user
      if (userData && userData[0] && userData[0].id) {
        console.log('\n--- Cleaning up: Deleting test user ---');
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', userData[0].id);
        
        if (deleteError) {
          console.log('Warning: Could not delete test user:', deleteError.message);
        } else {
          console.log('✅ Test user deleted successfully');
        }
      }
    }
    
    // Test 2: Try to insert an address record
    console.log('\n--- Test 2: Inserting a test address record ---');
    const testAddress = {
      label: 'Test Address',
      address_line: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      country: 'Test Country'
    };
    
    // First, we need a user ID. Let's get one from existing users
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (fetchError) {
      console.log('Warning: Could not fetch existing user:', fetchError.message);
    } else if (existingUsers && existingUsers.length > 0) {
      testAddress.user_id = existingUsers[0].id;
      
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .insert([testAddress])
        .select();
      
      if (addressError) {
        console.log('❌ Address insert failed:', addressError.message);
        console.log('This indicates RLS policies are still restrictive');
      } else {
        console.log('✅ Address insert succeeded!');
        console.log('Address data:', addressData);
        
        // If insert succeeded, try to delete the test address
        if (addressData && addressData[0] && addressData[0].id) {
          console.log('\n--- Cleaning up: Deleting test address ---');
          const { error: deleteError } = await supabase
            .from('addresses')
            .delete()
            .eq('id', addressData[0].id);
          
          if (deleteError) {
            console.log('Warning: Could not delete test address:', deleteError.message);
          } else {
            console.log('✅ Test address deleted successfully');
          }
        }
      }
    } else {
      console.log('No existing users found, skipping address test');
    }
    
    // Test 3: Try to insert an order record
    console.log('\n--- Test 3: Inserting a test order record ---');
    const testOrder = {
      product_name: 'Test Product',
      size: 'M',
      collection: 'Test Collection',
      total_amount: 99.99,
      gsm: 150,
      status: 'Pending'
    };
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([testOrder])
      .select();
    
    if (orderError) {
      console.log('❌ Order insert failed:', orderError.message);
      console.log('This indicates RLS policies are still restrictive');
    } else {
      console.log('✅ Order insert succeeded!');
      console.log('Order data:', orderData);
      
      // If insert succeeded, try to delete the test order
      if (orderData && orderData[0] && orderData[0].id) {
        console.log('\n--- Cleaning up: Deleting test order ---');
        const { error: deleteError } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderData[0].id);
        
        if (deleteError) {
          console.log('Warning: Could not delete test order:', deleteError.message);
        } else {
          console.log('✅ Test order deleted successfully');
        }
      }
    }
    
    console.log('\n--- Test Summary ---');
    console.log('If all tests showed ✅ success, then the RLS policies are working permissively.');
    console.log('If any tests showed ❌ failure, then RLS policies are still restrictive.');
    console.log('\nYou can now try your original operation again.');
    
  } catch (error) {
    console.error('Error during RLS test:', error);
  }
  
  process.exit(0);
}

testRLSFix();