-- Drop the restrictive RLS policy
DROP POLICY IF EXISTS "Enable read access for all users" ON public.admin_users;

-- Create a new policy that allows authenticated users to check admin status by email
CREATE POLICY "Allow checking admin status by email"
ON public.admin_users
FOR SELECT
TO authenticated
USING (true);

-- Add a policy to prevent unauthorized modifications
CREATE POLICY "Only superusers can modify admin_users"
ON public.admin_users
FOR ALL
USING (false)
WITH CHECK (false);