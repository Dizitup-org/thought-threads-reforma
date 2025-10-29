-- Create a security definer function to check if a user is an admin
-- This prevents RLS infinite recursion and allows admins to bypass user-level restrictions
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE email IN (
      SELECT email FROM auth.users WHERE id = user_id
    )
  )
$$;

-- Drop existing restrictive policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Create new policies for users table
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can insert their own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Fix orders policies
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

CREATE POLICY "Admins can view all orders"
  ON public.orders
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all orders"
  ON public.orders
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- Fix email_signups policies
DROP POLICY IF EXISTS "Only admins can view email signups" ON public.email_signups;

CREATE POLICY "Admins can view email signups"
  ON public.email_signups
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Also allow admins to manage products, collections, and sale_banners properly
DROP POLICY IF EXISTS "Only admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products
  FOR ALL
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage collections" ON public.collections;
CREATE POLICY "Admins can manage collections"
  ON public.collections
  FOR ALL
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage sale banners" ON public.sale_banners;
CREATE POLICY "Admins can manage sale banners"
  ON public.sale_banners
  FOR ALL
  USING (public.is_admin(auth.uid()));