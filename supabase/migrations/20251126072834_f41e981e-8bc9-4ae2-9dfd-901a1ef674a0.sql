-- Grant SELECT permission on users table to authenticated role
GRANT SELECT ON public.users TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Verify policies exist (they should from previous migrations)
-- Users can select their own profile
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'users_select_own'
  ) THEN
    CREATE POLICY "users_select_own"
    ON public.users
    FOR SELECT
    USING (auth.uid() = auth_user_id);
  END IF;
END $$;