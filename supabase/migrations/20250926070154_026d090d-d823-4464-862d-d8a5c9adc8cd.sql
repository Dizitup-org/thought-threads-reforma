-- Create products table for admin management
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  collection TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  sizes TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collections table
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email signups table
CREATE TABLE public.email_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table for WhatsApp order tracking
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  size TEXT NOT NULL,
  collection TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage products" 
ON public.products 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

-- Collections policies (public read, admin write)
CREATE POLICY "Collections are viewable by everyone" 
ON public.collections 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage collections" 
ON public.collections 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

-- Email signups policies (public insert, admin read)
CREATE POLICY "Anyone can subscribe to emails" 
ON public.email_signups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view email signups" 
ON public.email_signups 
FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin');

-- Orders policies (public insert, admin read)
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view orders" 
ON public.orders 
FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin');

-- Admin users policies (admin only)
CREATE POLICY "Only admins can manage admin users" 
ON public.admin_users 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

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

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial collections
INSERT INTO public.collections (name, description) VALUES
('Core Essentials', 'Timeless pieces that form the foundation of thoughtful wardrobes'),
('Minimalist Series', 'Pure forms and clean lines for minds that appreciate subtle sophistication');

-- Insert initial products
INSERT INTO public.products (name, price, collection, stock, sizes, description, featured) VALUES
('SAGE REFLECTION', 85.00, 'Core Essentials', 12, ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], 'Sophisticated simplicity in muted sage. For minds that seek clarity in complexity.', true),
('EARTH WISDOM', 90.00, 'Core Essentials', 8, ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], 'Rich brown elegance meets conscious design. Grounded luxury for thoughtful souls.', true),
('PURE THOUGHT', 80.00, 'Minimalist Series', 15, ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], 'Clean cream canvas for profound expression. Where less becomes infinitely more.', true);