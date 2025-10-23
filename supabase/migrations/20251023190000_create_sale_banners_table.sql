-- Create sale_banners table
CREATE TABLE IF NOT EXISTS public.sale_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sale_banners ENABLE ROW LEVEL SECURITY;

-- RLS policies for sale_banners
CREATE POLICY "Sale banners are viewable by everyone" 
ON public.sale_banners 
FOR SELECT 
USING (true);

CREATE POLICY "Sale banners are manageable by everyone" 
ON public.sale_banners 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_sale_banners_updated_at
BEFORE UPDATE ON public.sale_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();