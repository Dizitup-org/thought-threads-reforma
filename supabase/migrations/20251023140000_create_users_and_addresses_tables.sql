-- Create users table for storing user profile information
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create addresses table for storing user addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  label TEXT,
  address_line TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wishlist table for storing user wishlist items
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- RLS policies for users
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth_user_id = auth.uid());

-- RLS policies for addresses
CREATE POLICY "Users can view their own addresses" 
ON public.addresses 
FOR SELECT 
USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert their own addresses" 
ON public.addresses 
FOR INSERT 
WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own addresses" 
ON public.addresses 
FOR UPDATE 
USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete their own addresses" 
ON public.addresses 
FOR DELETE 
USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

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

-- Add trigger for updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at
BEFORE UPDATE ON public.addresses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can upload avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND owner = auth.uid());

CREATE POLICY "Users can delete their own avatars" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND owner = auth.uid());