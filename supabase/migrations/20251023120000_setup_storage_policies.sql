-- Setup storage policies for images bucket
-- This migration sets up proper RLS policies for the storage bucket used for product images

-- First, ensure the images bucket exists
-- Note: Bucket creation is typically done via the Supabase dashboard or API, not SQL
-- But we can set policies assuming the bucket exists

-- Create storage schema if it doesn't exist (usually already exists in Supabase)
-- CREATE SCHEMA IF NOT EXISTS storage;

-- Enable RLS on storage objects (usually already enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create policies for the images bucket
-- These policies allow authenticated users to upload and admin users to manage

-- Policy to allow authenticated users to insert objects in the images bucket
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Policy to allow anyone to select (view) objects from the images bucket (since it's public)
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Policy to allow admin users to update objects in the images bucket
CREATE POLICY "Admins can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_app_meta_data->>'role' = 'admin'
  )
);

-- Policy to allow admin users to delete objects in the images bucket
CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_app_meta_data->>'role' = 'admin'
  )
);

-- Create policies for buckets table as well
CREATE POLICY "Authenticated users can access images bucket"
ON storage.buckets FOR SELECT
TO authenticated
USING (id = 'images');

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;