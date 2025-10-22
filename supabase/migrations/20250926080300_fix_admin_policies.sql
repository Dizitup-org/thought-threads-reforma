-- Fix Admin Policies for Better Authentication Support
-- This migration updates the Row Level Security policies to work with the current admin authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Only admins can manage collections" ON public.collections;
DROP POLICY IF EXISTS "Only admins can manage admin users" ON public.admin_users;

-- Create updated policies that work with session-based authentication
-- Products policies (public read, admin write via session check)
CREATE POLICY "Only admins can manage products" 
ON public.products 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
  )
);

-- Collections policies (public read, admin write via session check)
CREATE POLICY "Only admins can manage collections" 
ON public.collections 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
  )
);

-- Admin users policies (admin only via session check)
CREATE POLICY "Only admins can manage admin users" 
ON public.admin_users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
  )
);

-- Grant necessary permissions
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.collections TO authenticated;
GRANT ALL ON public.admin_users TO authenticated;