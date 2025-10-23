-- Update products table to match the required schema
-- Add missing columns for GSM options, tags, discount, and multiple images

-- Add new columns
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS gsm_options INTEGER[],
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Migrate existing data
UPDATE public.products 
SET product_name = name,
    featured = featured,
    images = CASE WHEN image_url IS NOT NULL THEN ARRAY[image_url] ELSE '{}' END
WHERE product_name IS NULL;

-- Make product_name not null
ALTER TABLE public.products 
ALTER COLUMN product_name SET NOT NULL;

-- Drop old columns that are now replaced
ALTER TABLE public.products 
DROP COLUMN IF EXISTS name,
DROP COLUMN IF EXISTS image_url;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS products_collection_idx ON public.products(collection);
CREATE INDEX IF NOT EXISTS products_featured_idx ON public.products(featured);
CREATE INDEX IF NOT EXISTS products_discount_idx ON public.products(discount);