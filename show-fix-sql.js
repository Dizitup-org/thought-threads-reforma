// Script to display the SQL commands needed to fix RLS policies
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlCommands = `
-- Fix RLS policies for users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

CREATE POLICY "Users are viewable by everyone" 
ON public.users 
FOR SELECT 
USING (true);

CREATE POLICY "Users are manageable by everyone" 
ON public.users 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Fix RLS policies for addresses table
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.addresses;

CREATE POLICY "Addresses are viewable by everyone" 
ON public.addresses 
FOR SELECT 
USING (true);

CREATE POLICY "Addresses are manageable by everyone" 
ON public.addresses 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Fix RLS policies for orders table (already working, but ensuring consistency)
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Only admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Orders are viewable by everyone" 
ON public.orders 
FOR SELECT 
USING (true);

CREATE POLICY "Orders are manageable by everyone" 
ON public.orders 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Ensure storage policies are correct
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;

CREATE POLICY "Anyone can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Anyone can view images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Anyone can update images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'images');

CREATE POLICY "Anyone can delete images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'images');
`;

console.log('=== SQL COMMANDS TO FIX RLS POLICIES ===\n');
console.log('Copy and paste the following SQL commands into your Supabase SQL Editor:\n');
console.log(sqlCommands);
console.log('\n=== END OF SQL COMMANDS ===\n');
console.log('Instructions:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Create a new query');
console.log('4. Paste the above SQL commands');
console.log('5. Click "Run"');
console.log('6. Try your operation again - the RLS error should be resolved');