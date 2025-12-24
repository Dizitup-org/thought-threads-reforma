const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with public key (like the frontend does)
const supabasePublic = createClient(
  "https://qzfoorsiawmtkwefprvl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Zm9vcnNpYXdtdGt3ZWZwcnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Njk2ODEsImV4cCI6MjA3NDQ0NTY4MX0.Pj86r7wVK8aoDkyT1imlpdjwLo1EZKDG_0MCqLjtp2o"
);

async function debugAdminCheck() {
  console.log('Debugging admin check...');
  
  try {
    // Simulate what happens in Auth.tsx after login
    const email = 'adminxyz@reforma.com';
    
    console.log(`Checking if ${email} exists in admin_users table...`);
    
    // This is exactly what Auth.tsx does
    const { data: admin, error } = await supabasePublic
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();
    
    console.log('Query result:');
    console.log('Data:', admin);
    console.log('Error:', error);
    
    if (error) {
      console.log('Error occurred while checking admin status.');
      console.log('This might be due to RLS (Row Level Security) policies.');
      
      // Let's also try with service role key to see if that works
      console.log('\nTrying with service role key...');
      const supabaseService = createClient(
        "https://qzfoorsiawmtkwefprvl.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Zm9vcnNpYXdtdGt3ZWZwcnZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg2OTY4MSwiZXhwIjoyMDc0NDQ1NjgxfQ.7mWs4_dOty-ZYu_FS8dTsog_U45z1Vf_hVXLylRKuEE"
      );
      
      const { data: adminService, error: errorService } = await supabaseService
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();
      
      console.log('Service role query result:');
      console.log('Data:', adminService);
      console.log('Error:', errorService);
    } else {
      console.log('Admin check successful with public client.');
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

debugAdminCheck();