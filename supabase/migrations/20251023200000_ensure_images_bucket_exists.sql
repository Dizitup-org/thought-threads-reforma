-- Ensure images storage bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for images bucket
CREATE POLICY "Anyone can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Anyone can view images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Anyone can update images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'images');

CREATE POLICY "Anyone can delete images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'images');

CREATE POLICY "Anyone can access images bucket" 
ON storage.buckets 
FOR SELECT 
USING (id = 'images');