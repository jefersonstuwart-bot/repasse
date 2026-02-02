-- Create storage bucket for property photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-photos', 'property-photos', true);

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload property photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'property-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view property photos (public bucket)
CREATE POLICY "Property photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'property-photos');

-- Allow users to update their own photos
CREATE POLICY "Users can update their own property photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'property-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own property photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'property-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);