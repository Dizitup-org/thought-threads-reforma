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