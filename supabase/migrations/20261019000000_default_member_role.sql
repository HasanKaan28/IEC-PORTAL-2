-- ==============================================================================
-- IEC PORTAL - DEFAULT MEMBER ROLE AND PAGE PERMISSIONS (2026-10-19)
-- Run after 20261018000000_custom_roles.sql. Safe to run more than once.
-- Adds page permissions (which member pages a role sees) and one default role, "Üye", that
-- every signed-in member holds automatically. Its permissions are edited in the role builder.
-- ==============================================================================

-- 1. Page permissions join the list of allowed permission names.
ALTER TABLE public.custom_role_permissions DROP CONSTRAINT IF EXISTS custom_role_permission_name;
ALTER TABLE public.custom_role_permissions ADD CONSTRAINT custom_role_permission_name CHECK (permission IN (
  'pages.tasks', 'pages.projects', 'pages.hackathons', 'pages.events', 'pages.certificates', 'pages.messages',
  'roles.manage', 'audit.view', 'applications.review',
  'projects.create', 'projects.edit', 'projects.review_requests',
  'tasks.assign', 'tasks.manage',
  'events.manage', 'events.qr_host', 'certificates.issue',
  'hackathons.create',
  'blog.write', 'blog.publish', 'blog.moderate'
));

-- 2. One role can be the default; it applies to everyone and is never assigned row by row.
ALTER TABLE public.custom_roles ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS custom_roles_single_default ON public.custom_roles (is_default) WHERE is_default;

-- Reuse a role already named "Üye" if there is one, otherwise create it.
UPDATE public.custom_roles
SET is_default = true, updated_at = now()
WHERE lower(btrim(name)) = lower('Üye')
  AND NOT EXISTS (SELECT 1 FROM public.custom_roles WHERE is_default);

INSERT INTO public.custom_roles (name, description, color, is_default)
SELECT 'Üye', 'Her üyenin otomatik olarak sahip olduğu temel rol.', 'slate', true
WHERE NOT EXISTS (SELECT 1 FROM public.custom_roles WHERE is_default);

-- Members keep seeing the pages they saw before; the super admin can switch any of them off.
INSERT INTO public.custom_role_permissions (role_id, permission)
SELECT r.id, p.permission
FROM public.custom_roles r
CROSS JOIN (VALUES
  ('pages.tasks'), ('pages.projects'), ('pages.hackathons'),
  ('pages.events'), ('pages.certificates'), ('pages.messages')
) AS p(permission)
WHERE r.is_default
ON CONFLICT DO NOTHING;

-- The default role is never stored per member.
DELETE FROM public.user_custom_roles uc
USING public.custom_roles r
WHERE uc.role_id = r.id AND r.is_default;

-- 3. The permission check includes the default role for every signed-in member.
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
    )
    OR (
      _user_id IS NOT NULL
      AND EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id)
      AND EXISTS (
        SELECT 1
        FROM public.custom_roles r
        JOIN public.custom_role_permissions p ON p.role_id = r.id
        WHERE r.is_default AND p.permission = _permission
      )
    );
$$;
