-- Create new products table with the correct schema
-- First, rename the old table
ALTER TABLE public.products RENAME TO products_old;

-- Create the new products table with the correct schema
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  collection TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  sizes TEXT[] NOT NULL DEFAULT '{}',
  gsm_options INTEGER[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  discount INTEGER DEFAULT 0,
  description TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Copy data from old table to new table
INSERT INTO public.products (
  id, 
  product_name, 
  price, 
  images, 
  collection, 
  stock, 
  sizes, 
  gsm_options, 
  tags, 
  discount, 
  description, 
  featured, 
  created_at, 
  updated_at
)
SELECT 
  id,
  COALESCE(name, product_name, '') as product_name,
  price,
  CASE 
    WHEN image_url IS NOT NULL THEN ARRAY[image_url]
    ELSE '{}'
  END as images,
  collection,
  stock,
  sizes,
  COALESCE(gsm, gsm_options, '{}') as gsm_options,
  COALESCE(tags, '{}') as tags,
  COALESCE(discount_percentage, discount, 0) as discount,
  description,
  featured,
  created_at,
  updated_at
FROM public.products_old;

-- Create policies for the new products table
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Products are manageable by everyone" 
ON public.products 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX products_collection_idx ON public.products(collection);
CREATE INDEX products_featured_idx ON public.products(featured);
CREATE INDEX products_discount_idx ON public.products(discount);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Drop the old table
-- DROP TABLE public.products_old;