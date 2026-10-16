-- ==============================================================================
-- IEC PORTAL - CUSTOM ROLES (2026-10-18)
-- Super admins build roles from individual permissions and assign them to members.
-- Run after 20261017000000_security_hardening.sql. Safe to run more than once.
-- Keep permission names and the built-in mapping in sync with src/lib/rbac/permissions.ts.
-- ==============================================================================

-- 1. What each built-in role may do (super_admin is treated as "everything" in has_permission).
CREATE TABLE IF NOT EXISTS public.role_permission_defaults (
  role user_role_enum NOT NULL,
  permission text NOT NULL,
  PRIMARY KEY (role, permission)
);

INSERT INTO public.role_permission_defaults (role, permission) VALUES
  ('admin', 'roles.manage'), ('admin', 'audit.view'), ('admin', 'applications.review'),
  ('admin', 'projects.create'), ('admin', 'projects.edit'), ('admin', 'projects.review_requests'),
  ('admin', 'tasks.assign'), ('admin', 'tasks.manage'),
  ('admin', 'events.manage'), ('admin', 'events.qr_host'), ('admin', 'certificates.issue'),
  ('admin', 'hackathons.create'),
  ('admin', 'blog.write'), ('admin', 'blog.publish'), ('admin', 'blog.moderate'),
  ('leader', 'roles.manage'), ('leader', 'applications.review'),
  ('leader', 'projects.create'), ('leader', 'projects.edit'), ('leader', 'projects.review_requests'),
  ('leader', 'tasks.assign'), ('leader', 'tasks.manage'),
  ('leader', 'events.manage'), ('leader', 'events.qr_host'), ('leader', 'certificates.issue'),
  ('leader', 'hackathons.create'),
  ('leader', 'blog.write'), ('leader', 'blog.publish'),
  ('project_lead', 'projects.edit'), ('project_lead', 'projects.review_requests'),
  ('project_lead', 'tasks.assign'), ('project_lead', 'tasks.manage'),
  ('task_manager', 'tasks.assign'), ('task_manager', 'tasks.manage'),
  ('blog_author', 'blog.write'), ('blog_author', 'blog.publish')
ON CONFLICT DO NOTHING;

-- 2. Custom roles, their permissions, and who holds them.
CREATE TABLE IF NOT EXISTS public.custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT 'brand',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT custom_role_name_length CHECK (char_length(btrim(name)) BETWEEN 2 AND 40),
  CONSTRAINT custom_role_description_length CHECK (description IS NULL OR char_length(description) <= 200),
  CONSTRAINT custom_role_color CHECK (color IN ('brand', 'accent', 'emerald', 'rose', 'slate'))
);

CREATE UNIQUE INDEX IF NOT EXISTS custom_roles_name_unique ON public.custom_roles (lower(btrim(name)));

CREATE TABLE IF NOT EXISTS public.custom_role_permissions (
  role_id uuid NOT NULL REFERENCES public.custom_roles(id) ON DELETE CASCADE,
  permission text NOT NULL,
  PRIMARY KEY (role_id, permission),
  CONSTRAINT custom_role_permission_name CHECK (permission IN (
    'roles.manage', 'audit.view', 'applications.review',
    'projects.create', 'projects.edit', 'projects.review_requests',
    'tasks.assign', 'tasks.manage',
    'events.manage', 'events.qr_host', 'certificates.issue',
    'hackathons.create',
    'blog.write', 'blog.publish', 'blog.moderate'
  ))
);

CREATE TABLE IF NOT EXISTS public.user_custom_roles (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.custom_roles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS user_custom_roles_role_idx ON public.user_custom_roles (role_id);

-- Members can read roles (they appear on profiles and in the portal). Only the server writes them,
-- with the service role, after checking the caller's permissions; there are no write policies.
ALTER TABLE public.role_permission_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read role defaults" ON public.role_permission_defaults;
CREATE POLICY "Members read role defaults" ON public.role_permission_defaults
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Members read custom roles" ON public.custom_roles;
CREATE POLICY "Members read custom roles" ON public.custom_roles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Members read custom role permissions" ON public.custom_role_permissions;
CREATE POLICY "Members read custom role permissions" ON public.custom_role_permissions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Members read custom role assignments" ON public.user_custom_roles;
CREATE POLICY "Members read custom role assignments" ON public.user_custom_roles
  FOR SELECT TO authenticated USING (true);

-- 3. One permission check for both built-in and custom roles.
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin')
    OR EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.role_permission_defaults d ON d.role = ur.role
      WHERE ur.user_id = _user_id AND d.permission = _permission
    )
    OR EXISTS (
      SELECT 1
      FROM public.user_custom_roles uc
      JOIN public.custom_role_permissions p ON p.role_id = uc.role_id
      WHERE uc.user_id = _user_id AND p.permission = _permission
    );
$$;

REVOKE ALL ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;

-- 4. Policies that used fixed roles now ask for the matching permission, so custom roles work too.

-- Tasks: members with assign or manage rights may create and edit any task.
DROP POLICY IF EXISTS "Task managers manage tasks" ON public.tasks;
CREATE POLICY "Task managers manage tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'tasks.assign') OR public.has_permission(auth.uid(), 'tasks.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'tasks.assign') OR public.has_permission(auth.uid(), 'tasks.manage'));

-- Project join requests: the applicant, reviewers, and the project's lead can read them.
DROP POLICY IF EXISTS "Users view own project join requests" ON public.project_join_requests;
CREATE POLICY "Users view own project join requests" ON public.project_join_requests
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_permission(auth.uid(), 'projects.review_requests')
    OR EXISTS (
      SELECT 1 FROM public.project_members m
      WHERE m.project_id = project_join_requests.project_id AND m.user_id = auth.uid() AND m.role = 'lead'
    )
  );

-- Blog: everyone reads published posts; authors read their drafts; publishers and moderators read all.
DROP POLICY IF EXISTS "Published blog posts readable by all" ON public.blog_posts;
DROP POLICY IF EXISTS "Published blog posts readable by everyone" ON public.blog_posts;
CREATE POLICY "Published blog posts readable by everyone" ON public.blog_posts
  FOR SELECT TO anon, authenticated USING (status = 'published');
DROP POLICY IF EXISTS "Authors and editors read drafts" ON public.blog_posts;
CREATE POLICY "Authors and editors read drafts" ON public.blog_posts
  FOR SELECT TO authenticated
  USING (
    author_id = auth.uid()
    OR public.has_permission(auth.uid(), 'blog.publish')
    OR public.has_permission(auth.uid(), 'blog.moderate')
  );

-- Certificates: holders and issuers.
DROP POLICY IF EXISTS "Certificate holders and leaders read certificates" ON public.certificates;
CREATE POLICY "Certificate holders and leaders read certificates" ON public.certificates
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_permission(auth.uid(), 'certificates.issue'));

-- Attendance: the member, event managers and QR hosts.
DROP POLICY IF EXISTS "Users see own attendance" ON public.event_attendances;
CREATE POLICY "Users see own attendance" ON public.event_attendances
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_permission(auth.uid(), 'events.manage')
    OR public.has_permission(auth.uid(), 'events.qr_host')
  );

-- Audit log and applications.
DROP POLICY IF EXISTS "Audit logs readable by admins" ON public.audit_logs;
CREATE POLICY "Audit logs readable by admins" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.has_permission(auth.uid(), 'audit.view'));

DROP POLICY IF EXISTS "Admins read and review applications" ON public.applications;
CREATE POLICY "Admins read and review applications" ON public.applications
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'applications.review'))
  WITH CHECK (public.has_permission(auth.uid(), 'applications.review'));
