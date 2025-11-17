-- Fix product deletion foreign key constraint issue
-- Change orders.product_id foreign key to SET NULL on delete
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_product_id_fkey;

ALTER TABLE public.orders
ADD CONSTRAINT orders_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE SET NULL;

-- Also ensure product_name and collection remain even if product is deleted
-- (they're already text fields not foreign keys, so this is fine)