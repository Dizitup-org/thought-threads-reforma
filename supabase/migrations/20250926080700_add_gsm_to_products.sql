-- Add GSM (Grams per Square Meter) field to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS gsm INTEGER DEFAULT 180;

-- Add a constraint to ensure GSM is reasonable (between 100 and 300)
ALTER TABLE public.products 
ADD CONSTRAINT valid_gsm CHECK (gsm >= 100 AND gsm <= 300);

-- Update existing products with default GSM values
UPDATE public.products 
SET gsm = 180 
WHERE gsm IS NULL;