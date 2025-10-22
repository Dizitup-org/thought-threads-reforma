-- Add image upload support and site settings table

-- Add image_upload field to products (for direct file uploads)
ALTER TABLE public.products ADD COLUMN image_file_path TEXT;

-- Create site_settings table for admin configuration
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for site_settings
CREATE POLICY "Site settings are viewable by everyone" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

-- Create trigger for site_settings timestamps
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('site_title', 'REFORMA'),
('tagline', 'Fashion. Reimagined.'),
('about_text', 'Minimalist elegance for deep thinkers. Where sophisticated design meets conscious choices.'),
('contact_email', 'hello@reforma.com'),
('contact_phone', '+1 (555) 123-4567'),
('whatsapp_number', '1234567890'),
('instagram_url', 'https://instagram.com/reforma'),
('facebook_url', 'https://facebook.com/reforma');