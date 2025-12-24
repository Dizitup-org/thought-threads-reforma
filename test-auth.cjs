const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with public key (like the frontend does)
const supabase = createClient(
  "https://qzfoorsiawmtkwefprvl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Zm9vcnNpYXdtdGt3ZWZwcnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Njk2ODEsImV4cCI6MjA3NDQ0NTY4MX0.Pj86r7wVK8aoDkyT1imlpdjwLo1EZKDG_0MCqLjtp2o"
);

async function testAuth() {
  console.log('Testing authentication flow...');
  
  try {
    // Try to sign in with the admin credentials
    // You'll need to replace these with your actual admin credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'adminxyz@reforma.com',
      password: 'reforma1357$',
    });
    
    if (error) {
      console.error('Authentication error:', error.message);
      console.log('\nThis means the user exists in the admin_users table but not in Supabase Auth.');
      console.log('You need to sign up this user through the normal sign up process first.');
      return;
    }
    
    console.log('Authentication successful!');
    console.log('User data:', data.user);
    
    // Now check if this user is in the admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', data.user.email)
      .single();
    
    if (adminError || !adminUser) {
      console.log('User authenticated but not found in admin_users table.');
      console.log('Add this user to the admin_users table to grant admin access.');
      return;
    }
    
    console.log('User is properly set up as admin!');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

testAuth();