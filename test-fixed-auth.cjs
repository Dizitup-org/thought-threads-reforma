const { createClient } = require('@supabase/supabase-js');

async function testFixedAuth() {
  console.log('Testing authentication with fixed RLS policies...');
  
  try {
    // Create Supabase client with public key (like the frontend does)
    const supabasePublic = createClient(
      "https://qzfoorsiawmtkwefprvl.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Zm9vcnNpYXdtdGt3ZWZwcnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Njk2ODEsImV4cCI6MjA3NDQ0NTY4MX0.Pj86r7wVK8aoDkyT1imlpdjwLo1EZKDG_0MCqLjtp2o"
    );
    
    // Sign in with admin credentials
    console.log('Signing in with admin credentials...');
    const { data: authData, error: authError } = await supabasePublic.auth.signInWithPassword({
      email: 'adminxyz@reforma.com',
      password: 'reforma1357$',
    });
    
    if (authError) {
      console.error('Authentication failed:', authError.message);
      return;
    }
    
    console.log('Authentication successful!');
    console.log('User ID:', authData.user.id);
    console.log('Email:', authData.user.email);
    
    // Now test if we can access the admin_users table
    console.log('\nChecking admin access...');
    const { data: adminData, error: adminError } = await supabasePublic
      .from('admin_users')
      .select('*')
      .eq('email', 'adminxyz@reforma.com')
      .single();
    
    if (adminError) {
      console.log('Admin check failed:', adminError.message);
      console.log('This indicates RLS policies are still restrictive.');
      
      // Try to get session to see what role we have
      const { data: sessionData } = await supabasePublic.auth.getSession();
      console.log('Session data:', JSON.stringify(sessionData, null, 2));
      
    } else {
      console.log('Admin check successful!');
      console.log('Admin user found:', adminData);
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

testFixedAuth();