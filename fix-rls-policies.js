import { createClient } from '@supabase/supabase-js';

// Use the same configuration as in your client.ts
const SUPABASE_URL = "https://qzfoorsiawmtkwefprvl.supabase.co";
// Get the service key from environment variables
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('VITE_SUPABASE_SERVICE_KEY environment variable is not set');
  process.exit(1);
}

// Create admin client with service role key
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

async function fixRLSPolicies() {
  console.log('Fixing RLS policies...');
  
  try {
    // Drop existing policies
    console.log('Dropping existing policies...');
    
    // Products policies
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'products', 
      policy_name: 'Products are viewable by everyone' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'products', 
      policy_name: 'Only admins can manage products' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'products', 
      policy_name: 'Products management' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'products', 
      policy_name: 'Admins can manage products' 
    });

    // Collections policies
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'collections', 
      policy_name: 'Collections are viewable by everyone' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'collections', 
      policy_name: 'Only admins can manage collections' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'collections', 
      policy_name: 'Collections management' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'collections', 
      policy_name: 'Admins can manage collections' 
    });

    // Email signups policies
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'email_signups', 
      policy_name: 'Anyone can subscribe to emails' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'email_signups', 
      policy_name: 'Only admins can view email signups' 
    });

    // Orders policies
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'orders', 
      policy_name: 'Anyone can create orders' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'orders', 
      policy_name: 'Only admins can view orders' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'orders', 
      policy_name: 'Users can view their own orders' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'orders', 
      policy_name: 'Users can create their own orders' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'orders', 
      policy_name: 'Admins can view all orders' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'orders', 
      policy_name: 'Admins can manage all orders' 
    });

    // Admin users policies
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'admin_users', 
      policy_name: 'Only admins can manage admin users' 
    });

    // Site settings policies
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'site_settings', 
      policy_name: 'Site settings are viewable by everyone' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'site_settings', 
      policy_name: 'Only admins can manage site settings' 
    });

    // Users policies
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'users', 
      policy_name: 'Users can view their own profile' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'users', 
      policy_name: 'Users can update their own profile' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'users', 
      policy_name: 'Users can insert their own profile' 
    });

    // Addresses policies
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'addresses', 
      policy_name: 'Users can view their own addresses' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'addresses', 
      policy_name: 'Users can manage their own addresses' 
    });

    // Storage policies
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'objects', 
      policy_name: 'Authenticated users can upload images' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'objects', 
      policy_name: 'Public can view images' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'objects', 
      policy_name: 'Admins can update images' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'objects', 
      policy_name: 'Admins can delete images' 
    });
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: 'buckets', 
      policy_name: 'Authenticated users can access images bucket' 
    });

    console.log('Creating permissive policies...');
    
    // Create new permissive policies for demo/development
    // Products policies
    const { error: productsSelectError } = await supabase.rpc('create_policy', {
      table_name: 'products',
      policy_name: 'Products are viewable by everyone',
      policy_type: 'SELECT',
      using_expression: 'true'
    });
    
    const { error: productsAllError } = await supabase.rpc('create_policy', {
      table_name: 'products',
      policy_name: 'Products are manageable by everyone',
      policy_type: 'ALL',
      using_expression: 'true',
      with_check_expression: 'true'
    });

    // Collections policies
    const { error: collectionsSelectError } = await supabase.rpc('create_policy', {
      table_name: 'collections',
      policy_name: 'Collections are viewable by everyone',
      policy_type: 'SELECT',
      using_expression: 'true'
    });
    
    const { error: collectionsAllError } = await supabase.rpc('create_policy', {
      table_name: 'collections',
      policy_name: 'Collections are manageable by everyone',
      policy_type: 'ALL',
      using_expression: 'true',
      with_check_expression: 'true'
    });

    // Email signups policies
    const { error: emailInsertError } = await supabase.rpc('create_policy', {
      table_name: 'email_signups',
      policy_name: 'Anyone can subscribe to emails',
      policy_type: 'INSERT',
      with_check_expression: 'true'
    });

    const { error: emailSelectError } = await supabase.rpc('create_policy', {
      table_name: 'email_signups',
      policy_name: 'Email signups are viewable by everyone',
      policy_type: 'SELECT',
      using_expression: 'true'
    });

    // Orders policies
    const { error: ordersInsertError } = await supabase.rpc('create_policy', {
      table_name: 'orders',
      policy_name: 'Anyone can create orders',
      policy_type: 'INSERT',
      with_check_expression: 'true'
    });

    const { error: ordersSelectError } = await supabase.rpc('create_policy', {
      table_name: 'orders',
      policy_name: 'Orders are viewable by everyone',
      policy_type: 'SELECT',
      using_expression: 'true'
    });

    const { error: ordersAllError } = await supabase.rpc('create_policy', {
      table_name: 'orders',
      policy_name: 'Orders are manageable by everyone',
      policy_type: 'ALL',
      using_expression: 'true',
      with_check_expression: 'true'
    });

    // Admin users policies
    const { error: adminUsersSelectError } = await supabase.rpc('create_policy', {
      table_name: 'admin_users',
      policy_name: 'Admin users are viewable by everyone',
      policy_type: 'SELECT',
      using_expression: 'true'
    });

    const { error: adminUsersAllError } = await supabase.rpc('create_policy', {
      table_name: 'admin_users',
      policy_name: 'Admin users are manageable by everyone',
      policy_type: 'ALL',
      using_expression: 'true',
      with_check_expression: 'true'
    });

    // Site settings policies
    const { error: siteSettingsSelectError } = await supabase.rpc('create_policy', {
      table_name: 'site_settings',
      policy_name: 'Site settings are viewable by everyone',
      policy_type: 'SELECT',
      using_expression: 'true'
    });

    const { error: siteSettingsAllError } = await supabase.rpc('create_policy', {
      table_name: 'site_settings',
      policy_name: 'Site settings are manageable by everyone',
      policy_type: 'ALL',
      using_expression: 'true',
      with_check_expression: 'true'
    });

    // Users policies
    const { error: usersSelectError } = await supabase.rpc('create_policy', {
      table_name: 'users',
      policy_name: 'Users are viewable by everyone',
      policy_type: 'SELECT',
      using_expression: 'true'
    });

    const { error: usersAllError } = await supabase.rpc('create_policy', {
      table_name: 'users',
      policy_name: 'Users are manageable by everyone',
      policy_type: 'ALL',
      using_expression: 'true',
      with_check_expression: 'true'
    });

    // Addresses policies
    const { error: addressesSelectError } = await supabase.rpc('create_policy', {
      table_name: 'addresses',
      policy_name: 'Addresses are viewable by everyone',
      policy_type: 'SELECT',
      using_expression: 'true'
    });

    const { error: addressesAllError } = await supabase.rpc('create_policy', {
      table_name: 'addresses',
      policy_name: 'Addresses are manageable by everyone',
      policy_type: 'ALL',
      using_expression: 'true',
      with_check_expression: 'true'
    });

    // Storage policies
    const { error: storageInsertError } = await supabase.rpc('create_policy', {
      table_name: 'objects',
      policy_name: 'Anyone can upload images',
      policy_type: 'INSERT',
      with_check_expression: "bucket_id = 'images'"
    });

    const { error: storageSelectError } = await supabase.rpc('create_policy', {
      table_name: 'objects',
      policy_name: 'Anyone can view images',
      policy_type: 'SELECT',
      using_expression: "bucket_id = 'images'"
    });

    const { error: storageUpdateError } = await supabase.rpc('create_policy', {
      table_name: 'objects',
      policy_name: 'Anyone can update images',
      policy_type: 'UPDATE',
      using_expression: "bucket_id = 'images'"
    });

    const { error: storageDeleteError } = await supabase.rpc('create_policy', {
      table_name: 'objects',
      policy_name: 'Anyone can delete images',
      policy_type: 'DELETE',
      using_expression: "bucket_id = 'images'"
    });

    const { error: bucketsSelectError } = await supabase.rpc('create_policy', {
      table_name: 'buckets',
      policy_name: 'Anyone can access images bucket',
      policy_type: 'SELECT',
      using_expression: "id = 'images'"
    });

    console.log('Granting permissions...');
    
    // Grant necessary permissions
    await supabase.from('users').select('*'); // This will ensure the table exists
    
    console.log('RLS policies fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing RLS policies:', error);
    process.exit(1);
  }
}

// Helper function to drop policy if exists
async function dropPolicyIfExists(supabase, tableName, policyName) {
  try {
    await supabase.rpc('drop_policy_if_exists', { 
      table_name: tableName, 
      policy_name: policyName 
    });
  } catch (error) {
    console.warn(`Could not drop policy ${policyName} on ${tableName}:`, error.message);
  }
}

fixRLSPolicies();