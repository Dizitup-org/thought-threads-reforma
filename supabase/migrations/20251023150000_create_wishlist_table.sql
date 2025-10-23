-- Create wishlist table for storing user wishlist items
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- RLS policies for wishlist
CREATE POLICY "Users can view their own wishlist" 
ON public.wishlist 
FOR SELECT 
USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert their own wishlist items" 
ON public.wishlist 
FOR INSERT 
WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete their own wishlist items" 
ON public.wishlist 
FOR DELETE 
USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS wishlist_user_id_idx ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS wishlist_product_id_idx ON public.wishlist(product_id);