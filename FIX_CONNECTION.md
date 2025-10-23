# How to Fix Frontend-Backend Connection Issues

## The Problem
The frontend is not properly connected to the backend because of Row Level Security (RLS) policies in Supabase that prevent write operations.

## Solution Steps

### 1. Fix Supabase RLS Policies

1. **Log in to your Supabase Dashboard**
   - Go to https://app.supabase.com/
   - Log in with your credentials

2. **Navigate to Table Editor**
   - Select your project
   - Go to "Table Editor" in the left sidebar

3. **Fix Products Table Policies**
   - Click on the "products" table
   - Click on the "Policies" tab
   - Find the INSERT policy (or create one if it doesn't exist)
   - Edit the policy with these settings:
     - Name: "Enable insert for everyone"
     - Operation: INSERT
     - USING clause: (leave empty or set to "true")
     - WITH CHECK clause: (leave empty or set to "true")

4. **Fix UPDATE and DELETE Policies**
   - Similarly, update the UPDATE and DELETE policies to allow operations
   - For development, you can set them to:
     - USING: true
     - WITH CHECK: true (for INSERT/UPDATE only)

### 2. Create the Images Storage Bucket

1. **Go to Storage in Supabase Dashboard**
   - Click on "Storage" in the left sidebar

2. **Create Images Bucket**
   - Click "New Bucket"
   - Name it "images"
   - Set it as "Public"
   - Click "Create"

3. **Set Bucket Policies**
   - Click on the "images" bucket
   - Go to "Policies" tab
   - Make sure these policies exist:
     - SELECT: Allow for "anon" and "authenticated"
     - INSERT: Allow for "anon" and "authenticated"
     - UPDATE: Allow for "anon" and "authenticated"
     - DELETE: Allow for "anon" and "authenticated"

### 3. Apply Migration Files

The project includes migration files that should be applied to fix database schema and policies:

1. **List of Migration Files to Apply:**
   - `supabase/migrations/20251023120000_setup_storage_policies.sql`
   - `supabase/migrations/20251023123000_create_guest_users_table.sql`
   - `supabase/migrations/20251023130000_fix_rls_policies.sql`
   - `supabase/migrations/20251023131000_comprehensive_rls_fix.sql`

2. **How to Apply Migrations:**
   - Copy the content of each SQL file
   - In Supabase Dashboard, go to "SQL Editor"
   - Paste and run each migration file content
   - Run them in order (by filename timestamp)

### 4. Test the Connection

1. **Visit the Connection Test Page**
   - Go to http://localhost:8084/connection-test
   - Click "Test Connection" to verify read operations
   - Click "Create Test Product" to verify write operations

2. **Visit the Admin Panel**
   - Go to http://localhost:8084/admin
   - Try to add a new product
   - Try to delete an existing product

### 5. Verify Real-time Updates

1. **Open two browser windows:**
   - Window 1: Admin panel (http://localhost:8084/admin)
   - Window 2: Home page (http://localhost:8084/)

2. **Test real-time sync:**
   - In Admin panel, add a new product
   - Check if it immediately appears on the Home page
   - Delete a product in Admin panel
   - Check if it immediately disappears from the Home page

## Alternative Quick Fix for Development

If you want to quickly bypass RLS for development:

1. **Disable RLS on Tables:**
   - In Supabase SQL Editor, run:
   ```sql
   ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.collections DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
   ```

2. **Re-enable RLS when ready for production:**
   ```sql
   ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
   ```

## Troubleshooting

### If you still get "row-level security policy" errors:

1. **Check that all policies are applied correctly**
2. **Verify the bucket name is exactly "images"**
3. **Ensure the bucket is set to public**
4. **Check that you're using the correct Supabase URL and keys**

### If real-time updates don't work:

1. **Check browser console for errors**
2. **Verify Supabase project has Realtime enabled**
3. **Check that you're using the same Supabase project for frontend and backend**

## Need Help?

If you're still having issues after following these steps:

1. **Visit the RLS Fix page**: http://localhost:8084/rls-fix
2. **Run the diagnosis tool**
3. **Share the logs with me for more specific help**

The connection issues you're experiencing are common when setting up Supabase with RLS policies. Once the policies are properly configured, everything should work seamlessly.