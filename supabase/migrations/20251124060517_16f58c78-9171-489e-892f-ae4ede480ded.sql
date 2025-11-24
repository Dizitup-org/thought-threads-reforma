-- Grant necessary permissions on users table (no sequence needed for uuid)
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- Also ensure anon role can't access users table  
REVOKE ALL ON public.users FROM anon;

-- Force refresh the policies
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;