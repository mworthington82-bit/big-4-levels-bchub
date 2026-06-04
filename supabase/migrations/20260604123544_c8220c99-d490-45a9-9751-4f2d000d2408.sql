
DROP POLICY IF EXISTS "Anyone can view evidence files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload evidence files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own evidence files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own evidence files" ON storage.objects;

CREATE POLICY "Authenticated users can view evidence files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'leader-evidence');

CREATE POLICY "Authenticated users can upload evidence files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'leader-evidence' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own evidence files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'leader-evidence' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own evidence files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'leader-evidence' AND (auth.uid())::text = (storage.foldername(name))[1]);
