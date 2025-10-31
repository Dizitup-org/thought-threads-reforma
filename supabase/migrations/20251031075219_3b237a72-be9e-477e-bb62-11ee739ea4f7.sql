-- Create a simpler admin check function that takes email
CREATE OR REPLACE FUNCTION public.is_admin_by_email(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE email = user_email
  )
$$;

-- Update is_admin to use the email-based function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  
  -- Check if email exists in admin_users
  RETURN is_admin_by_email(user_email);
END;
$$;

-- Update all RLS policies to use simpler auth.email() approach
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" 
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" 
ON public.orders 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can view email signups" ON public.email_signups;
CREATE POLICY "Admins can view email signups" 
ON public.email_signups 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can manage collections" ON public.collections;
CREATE POLICY "Admins can manage collections" 
ON public.collections 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can manage sale banners" ON public.sale_banners;
CREATE POLICY "Admins can manage sale banners" 
ON public.sale_banners 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);