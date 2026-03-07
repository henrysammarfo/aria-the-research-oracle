
-- Create storage bucket for research file attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('research-attachments', 'research-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'research-attachments');

-- Allow public read
CREATE POLICY "Public read of research attachments"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'research-attachments');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'research-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
