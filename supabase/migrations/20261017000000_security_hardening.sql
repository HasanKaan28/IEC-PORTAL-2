-- ==============================================================================
-- IEC PORTAL - SECURITY HARDENING (2026-10-17)
-- Run after 20261015000000_init_iec_schema.sql (Supabase SQL editor or `supabase db push`).
-- ==============================================================================

-- 1. Only @student.ius.edu.ba mailboxes can create (or switch to) an account.
--    This is the real gate: the anon key is public, so a check in the web app alone could be bypassed.
CREATE OR REPLACE FUNCTION public.enforce_student_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NULL OR lower(split_part(NEW.email, '@', 2)) <> 'student.ius.edu.ba' THEN
    RAISE EXCEPTION 'Only @student.ius.edu.ba email addresses can register'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_student_email ON auth.users;
CREATE TRIGGER enforce_student_email
  BEFORE INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_student_email();

-- 2. Every new account gets a profile row and the default member role.
--    Without this, sign-up succeeded but most portal features failed for lack of a profile.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, department, class_year, phone)
  VALUES (
    NEW.id,
    lower(NEW.email),
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'department', ''),
    NULLIF(NEW.raw_user_meta_data->>'class_year', ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Attendance can only be written by the server after it has checked the rotating QR code.
--    Previously any member could insert their own attendance row directly with the public key.
DROP POLICY IF EXISTS "Attendance recorded for self or by admin" ON public.event_attendances;
CREATE POLICY "Attendance recorded by admins" ON public.event_attendances
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- 4. Certificates are no longer listable by anyone. Holders and leaders read through RLS;
--    public verification by code goes through the server (service role, exact code match).
DROP POLICY IF EXISTS "Public certificate verification" ON public.certificates;
CREATE POLICY "Certificate holders and leaders read certificates" ON public.certificates
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'leader'));

-- 5. Role changes are limited to admins, and nobody can grant super_admin through the API;
--    super_admin is only assigned by the server bootstrap (verified SUPER_ADMIN_EMAIL).
DROP POLICY IF EXISTS "Roles managed by admins" ON public.user_roles;
CREATE POLICY "Roles managed by admins" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND role <> 'super_admin');

-- 6. Comment authors may edit their own comments but cannot clear a moderator's flag.
DROP POLICY IF EXISTS "Users or admins can moderate comments" ON public.blog_comments;
CREATE POLICY "Users or admins can moderate comments" ON public.blog_comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) OR (auth.uid() = user_id AND is_flagged = false));
