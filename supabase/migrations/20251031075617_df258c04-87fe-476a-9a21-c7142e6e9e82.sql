-- Create security definer function to check if a user_id belongs to the authenticated user
-- This prevents recursive RLS issues
CREATE OR REPLACE FUNCTION public.is_owner(table_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = table_user_id AND auth_user_id = auth.uid()
  )
$$;

-- Update orders policies to use the security definer function
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (public.is_owner(user_id));

DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (public.is_owner(user_id));

-- Update addresses policies
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.addresses;
CREATE POLICY "Users can view their own addresses" 
ON public.addresses 
FOR SELECT 
USING (public.is_owner(user_id));

DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.addresses;
CREATE POLICY "Users can manage their own addresses" 
ON public.addresses 
FOR ALL 
USING (public.is_owner(user_id));

-- Update cart policies
DROP POLICY IF EXISTS "Users can view their own cart" ON public.cart;
CREATE POLICY "Users can view their own cart" 
ON public.cart 
FOR SELECT 
USING (public.is_owner(user_id));

DROP POLICY IF EXISTS "Users can insert into their own cart" ON public.cart;
CREATE POLICY "Users can insert into their own cart" 
ON public.cart 
FOR INSERT 
WITH CHECK (public.is_owner(user_id));

DROP POLICY IF EXISTS "Users can update their own cart" ON public.cart;
CREATE POLICY "Users can update their own cart" 
ON public.cart 
FOR UPDATE 
USING (public.is_owner(user_id));

DROP POLICY IF EXISTS "Users can delete from their own cart" ON public.cart;
CREATE POLICY "Users can delete from their own cart" 
ON public.cart 
FOR DELETE 
USING (public.is_owner(user_id));

-- Update wishlist policies
DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.wishlist;
CREATE POLICY "Users can view their own wishlist" 
ON public.wishlist 
FOR SELECT 
USING (public.is_owner(user_id));

DROP POLICY IF EXISTS "Users can add to their own wishlist" ON public.wishlist;
CREATE POLICY "Users can add to their own wishlist" 
ON public.wishlist 
FOR INSERT 
WITH CHECK (public.is_owner(user_id));

DROP POLICY IF EXISTS "Users can remove from their own wishlist" ON public.wishlist;
CREATE POLICY "Users can remove from their own wishlist" 
ON public.wishlist 
FOR DELETE 
USING (public.is_owner(user_id));