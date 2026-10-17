-- ==============================================================================
-- IEC PORTAL - BLOG IMAGES (2026-10-24)
-- Storage bucket for photos placed inside blog posts and for cover images.
-- Run after 20261023000000_privilege_hardening.sql. Safe to run more than once.
--
-- Files live at blog-images/<author id>/<random name>. The portal uploads through a server action
-- (it checks blog.write, the file's real bytes, the size and a rate limit), but these policies hold
-- on their own too: a member with blog.write may only write inside their own folder.
-- ==============================================================================

-- 1. Public bucket: anyone with the link can view an image, which published posts need.
--    4 MB matches the server check (Vercel rejects request bodies over 4.5 MB).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  4194304,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Public URLs work without a SELECT policy. There is deliberately no "everyone can read"
--    policy, because that would also let anyone list every file in the bucket through the API.
--    Authors may list and read their own folder.
DROP POLICY IF EXISTS "Blog authors read own images" ON storage.objects;
CREATE POLICY "Blog authors read own images" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'blog-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "Blog authors upload into own folder" ON storage.objects;
CREATE POLICY "Blog authors upload into own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'blog-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND public.has_permission((SELECT auth.uid()), 'blog.write')
  );

DROP POLICY IF EXISTS "Blog authors update own images" ON storage.objects;
CREATE POLICY "Blog authors update own images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'blog-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'blog-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND public.has_permission((SELECT auth.uid()), 'blog.write')
  );

DROP POLICY IF EXISTS "Blog authors delete own images" ON storage.objects;
CREATE POLICY "Blog authors delete own images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'blog-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
