-- Fix users table RLS policies to allow profile access and updates
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Create clean policies that work for both regular users and admins
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = auth_user_id);

-- Policy 2: Admins can view all users using the security definer function
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
USING (
  public.is_admin_by_email(
    (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- Policy 4: Admins can update any profile
CREATE POLICY "Admins can update any profile"
ON public.users
FOR UPDATE
USING (
  public.is_admin_by_email(
    (SELECT email FROM auth.users WHERE id = auth.uid())
  )
)
WITH CHECK (
  public.is_admin_by_email(
    (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Policy 5: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = auth_user_id);

-- Make sure storage policies allow avatar uploads
-- Users can upload to their own folder in avatars bucket
DROP POLICY IF EXISTS "Authenticated users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

CREATE POLICY "Authenticated users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');