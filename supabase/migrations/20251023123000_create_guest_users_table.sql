-- Create guest_users table for storing information from the welcome animation
CREATE TABLE IF NOT EXISTS public.guest_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guest_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for guest_users
CREATE POLICY "Guest users are viewable by admins" 
ON public.guest_users 
FOR SELECT 
USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Anyone can create guest user profiles" 
ON public.guest_users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own guest profile" 
ON public.guest_users 
FOR UPDATE 
USING (id = (SELECT id FROM public.guest_users WHERE email = CURRENT_USER));

-- Add trigger for updated_at
CREATE TRIGGER update_guest_users_updated_at
BEFORE UPDATE ON public.guest_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();