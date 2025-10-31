-- Fix the is_admin function to access auth schema correctly
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE email = (
      SELECT email FROM auth.users WHERE id = user_id
    )
  )
$$;