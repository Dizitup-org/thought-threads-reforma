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
INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('admin_phone', '919831681756'),
  ('site_title', 'RēForma'),
  ('site_description', 'Minimalist elegance meets conscious design'),
  ('contact_email', 'contact@reforma.com'),
  ('social_instagram', 'https://instagram.com/reformathreads'),
  ('social_twitter', 'https://twitter.com/reformathreads');

-- Create function to get site settings
CREATE OR REPLACE FUNCTION get_site_setting(setting_key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT setting_value 
    FROM site_settings 
    WHERE site_settings.setting_key = $1
  );
END;
$$ LANGUAGE plpgsql;
