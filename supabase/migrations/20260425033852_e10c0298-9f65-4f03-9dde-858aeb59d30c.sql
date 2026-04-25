-- Create private receipts bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Users can read their own receipt files
CREATE POLICY "receipts_select_own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can read all receipts
CREATE POLICY "receipts_select_admin"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts'
  AND public.has_role(auth.uid(), 'admin')
);

-- Users can upload to their own folder
CREATE POLICY "receipts_insert_own"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own files
CREATE POLICY "receipts_update_own"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own files
CREATE POLICY "receipts_delete_own"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can delete any receipt file
CREATE POLICY "receipts_delete_admin"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts'
  AND public.has_role(auth.uid(), 'admin')
);