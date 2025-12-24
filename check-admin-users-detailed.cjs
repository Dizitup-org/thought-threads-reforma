const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with service key for full access
const supabase = createClient(
  "https://qzfoorsiawmtkwefprvl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Zm9vcnNpYXdtdGt3ZWZwcnZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg2OTY4MSwiZXhwIjoyMDc0NDQ1NjgxfQ.7mWs4_dOty-ZYu_FS8dTsog_U45z1Vf_hVXLylRKuEE"
);

async function checkAdminUsers() {
  console.log('Checking admin users in database...');
  
  try {
    // Check if there are any admin users
    const { data: adminUsers, error } = await supabase
      .from('admin_users')
      .select('*');
    
    if (error) {
      console.error('Error fetching admin users:', error);
      return;
    }
    
    console.log('All admin users found:', JSON.stringify(adminUsers, null, 2));
    
    // Check specifically for the email we're testing
    const { data: specificAdmin, error: specificError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'adminxyz@reforma.com');
    
    if (specificError) {
      console.error('Error fetching specific admin user:', specificError);
      return;
    }
    
    console.log('\nSpecific admin user check:', JSON.stringify(specificAdmin, null, 2));
    
  } catch (err) {
    console.error('Error:', err);
  }
}

checkAdminUsers();