-- Add image_file_path column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing products to use the new column
UPDATE public.products 
SET image_file_path = SUBSTRING(image_url FROM POSITION('/product-images/' IN image_url))
WHERE image_url LIKE '%/product-images/%';