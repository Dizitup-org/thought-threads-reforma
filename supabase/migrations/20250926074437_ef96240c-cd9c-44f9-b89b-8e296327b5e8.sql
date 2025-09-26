-- Check what columns already exist and add only missing ones
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS discounted_price NUMERIC,
ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN DEFAULT false;

-- Create trigger to automatically calculate discounted price
CREATE OR REPLACE FUNCTION public.calculate_discounted_price()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.discount_percentage > 0 THEN
    NEW.discounted_price := NEW.price * (1 - NEW.discount_percentage::decimal / 100);
    NEW.is_on_sale := true;
  ELSE
    NEW.discounted_price := NULL;
    NEW.is_on_sale := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS calculate_discounted_price_trigger ON public.products;
CREATE TRIGGER calculate_discounted_price_trigger
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.calculate_discounted_price();

-- Create a table for managing site-wide sale banners
CREATE TABLE IF NOT EXISTS public.sale_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for sale_banners
ALTER TABLE public.sale_banners ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Sale banners are viewable by everyone" ON public.sale_banners;
DROP POLICY IF EXISTS "Only admins can manage sale banners" ON public.sale_banners;

-- RLS policies for sale_banners
CREATE POLICY "Sale banners are viewable by everyone" 
ON public.sale_banners 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage sale banners" 
ON public.sale_banners 
FOR ALL 
USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Add trigger for sale_banners updated_at
DROP TRIGGER IF EXISTS update_sale_banners_updated_at ON public.sale_banners;
CREATE TRIGGER update_sale_banners_updated_at
BEFORE UPDATE ON public.sale_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sale banner if not exists
INSERT INTO public.sale_banners (message, is_active) 
SELECT 'Special Winter Collection - Limited Time Offer!', true
WHERE NOT EXISTS (SELECT 1 FROM public.sale_banners LIMIT 1);