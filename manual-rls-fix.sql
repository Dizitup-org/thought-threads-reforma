-- Manually fix RLS policies for admin_users table

-- First, disable RLS temporarily
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Only admins can manage admin users" ON public.admin_users;

-- Create new permissive policies that allow everyone to read (but only admins to write)
CREATE POLICY "Admin users are viewable by everyone" 
ON public.admin_users 
FOR SELECT 
USING (true);

CREATE POLICY "Admin users are manageable by admins" 
ON public.admin_users 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'service_role');