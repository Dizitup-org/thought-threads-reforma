-- Update orders table to include missing fields
-- Add customer_name column
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Add total_amount column
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2);

-- Add gsm column
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS gsm INTEGER;

-- Add user_id column for linking to users table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);

-- Add address_id column for linking to addresses table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES public.addresses(id);

-- Update RLS policies to allow users to view their own orders
DROP POLICY IF EXISTS "Only admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Orders are viewable by everyone" ON public.orders;

CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage orders" 
ON public.orders 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');