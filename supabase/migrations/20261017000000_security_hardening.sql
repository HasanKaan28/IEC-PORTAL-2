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

-- 7. The per-event QR signing secret never leaves the server. Events stay publicly readable,
--    but only through these columns; the secret is read with the service role after a permission check.
REVOKE SELECT ON public.events FROM anon, authenticated;
GRANT SELECT (id, title, description, venue, date_time, created_at) ON public.events TO anon, authenticated;

-- 8. Membership applications now go through the club's Google Form, so the open public insert is closed.
DROP POLICY IF EXISTS "Anyone can submit application" ON public.applications;

-- 9. Members edit their own profile fields, but not the account id, email or creation time.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, avatar_url, department, class_year, bio, linkedin_url, github_url, phone, hide_phone, hide_email, updated_at)
  ON public.profiles TO authenticated;

-- 10. The receiver of a direct message may only mark it as read, not rewrite it.
REVOKE UPDATE ON public.direct_messages FROM authenticated;
GRANT UPDATE (is_read) ON public.direct_messages TO authenticated;

-- 11. Tasks: the old catch-all policy let any member create tasks for others or rewrite tasks freely.
DROP POLICY IF EXISTS "Tasks manageable by task managers or admins" ON public.tasks;

CREATE POLICY "Task managers manage tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'task_manager') OR public.has_role(auth.uid(), 'project_lead')
    OR public.has_role(auth.uid(), 'leader') OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'task_manager') OR public.has_role(auth.uid(), 'project_lead')
    OR public.has_role(auth.uid(), 'leader') OR public.is_admin(auth.uid())
  );

CREATE POLICY "Members create their own tasks" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (creator_id = auth.uid() AND (assignee_id IS NULL OR assignee_id = auth.uid()));

CREATE POLICY "Creators and assignees update tasks" ON public.tasks
  FOR UPDATE TO authenticated
  USING (creator_id = auth.uid() OR assignee_id = auth.uid())
  WITH CHECK (creator_id = auth.uid() OR assignee_id = auth.uid());

CREATE POLICY "Creators delete their tasks" ON public.tasks
  FOR DELETE TO authenticated
  USING (creator_id = auth.uid());

-- 12. Project join requests start as pending, and a member has at most one pending request per project.
DROP POLICY IF EXISTS "Users can create join request" ON public.project_join_requests;
CREATE POLICY "Users can create join request" ON public.project_join_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending' AND reviewer_id IS NULL);

CREATE UNIQUE INDEX IF NOT EXISTS one_pending_project_request
  ON public.project_join_requests (project_id, user_id)
  WHERE status = 'pending';

-- 12b. Hackathon join requests: applicants create pending requests and may withdraw them; only the
--      team captain or an admin decides on them. Previously applicants could approve themselves.
DROP POLICY IF EXISTS "Team requests managed by users and leaders" ON public.hackathon_join_requests;

CREATE POLICY "Applicants and captains read team requests" ON public.hackathon_join_requests
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.hackathon_teams t WHERE t.id = team_id AND t.leader_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Applicants create pending team requests" ON public.hackathon_join_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Captains decide on team requests" ON public.hackathon_join_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.hackathon_teams t WHERE t.id = team_id AND t.leader_id = auth.uid())
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.hackathon_teams t WHERE t.id = team_id AND t.leader_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Applicants withdraw, captains remove team requests" ON public.hackathon_join_requests
  FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.hackathon_teams t WHERE t.id = team_id AND t.leader_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

CREATE UNIQUE INDEX IF NOT EXISTS one_pending_team_request
  ON public.hackathon_join_requests (team_id, user_id)
  WHERE status = 'pending';

-- 12c. One certificate per member per event.
CREATE UNIQUE INDEX IF NOT EXISTS one_certificate_per_event
  ON public.certificates (event_id, user_id);

-- 13. Email and phone are no longer readable column by column by every member. The app reads them
--     through member_contact(), which returns them only to the owner, an admin, or when not hidden.
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, full_name, avatar_url, department, class_year, bio, linkedin_url, github_url, hide_phone, hide_email, created_at, updated_at)
  ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.member_contact(_member_id uuid)
RETURNS TABLE (email text, phone text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE WHEN p.id = auth.uid() OR NOT p.hide_email OR public.is_admin(auth.uid()) THEN p.email END,
    CASE WHEN p.id = auth.uid() OR NOT p.hide_phone OR public.is_admin(auth.uid()) THEN p.phone END
  FROM public.profiles p
  WHERE p.id = _member_id AND auth.uid() IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.member_contact(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.member_contact(uuid) TO authenticated;

-- 14. Live delivery of direct messages (Supabase Realtime still applies the RLS policies above).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'direct_messages'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
  END IF;
END;
$$;
