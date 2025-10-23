-- Create cart table for user cart items
CREATE TABLE IF NOT EXISTS public.cart (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  size text NOT NULL,
  gsm integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, size, gsm)
);

-- Enable RLS on cart
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Cart policies
CREATE POLICY "Users can view their own cart"
ON public.cart
FOR SELECT
USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = cart.user_id));

CREATE POLICY "Users can insert into their own cart"
ON public.cart
FOR INSERT
WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE id = cart.user_id));

CREATE POLICY "Users can update their own cart"
ON public.cart
FOR UPDATE
USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = cart.user_id));

CREATE POLICY "Users can delete from their own cart"
ON public.cart
FOR DELETE
USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = cart.user_id));

-- Add GSM column to products if not exists (for product material details)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS gsm integer[];

-- Update trigger for cart
CREATE TRIGGER update_cart_updated_at
BEFORE UPDATE ON public.cart
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add order status options and update orders table
ALTER TABLE public.orders
ALTER COLUMN status SET DEFAULT 'Pending';

-- Add customer contact fields to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS gsm integer;