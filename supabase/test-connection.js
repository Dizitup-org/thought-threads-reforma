// Simple Node.js script to test Supabase connection
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://qzfoorsiawmtkwefprvl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Zm9vcnNpYXdtdGt3ZWZwcnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Njk2ODEsImV4cCI6MjA3NDQ0NTY4MX0.Pj86r7wVK8aoDkyT1imlpdjwLo1EZKDG_0MCqLjtp2o";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.error('Connection failed:', error.message);
      return;
    }
    
    console.log('Connection successful!');
    console.log('Sample data:', data);
    
    // Test insert
    const testProduct = {
      name: 'Connection Test Product',
      price: 100,
      collection: 'Test',
      stock: 1,
      sizes: ['M'],
      description: 'Test product'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([testProduct]);
    
    if (insertError) {
      console.error('Insert failed:', insertError.message);
    } else {
      console.log('Insert successful!');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testConnection();