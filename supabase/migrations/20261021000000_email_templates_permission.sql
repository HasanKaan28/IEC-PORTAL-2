-- ==============================================================================
-- IEC PORTAL - SEPARATE EMAIL TEMPLATES PERMISSION (2026-10-21)
-- Run after 20261020000000_monthly_plan.sql. Safe to run more than once.
-- Email template previews used to come with roles.manage. They now have their own permission,
-- emails.view, so roles and email templates can be switched on separately in the role builder.
-- ==============================================================================

-- 1. The new permission joins the allowed list.
ALTER TABLE public.custom_role_permissions DROP CONSTRAINT IF EXISTS custom_role_permission_name;
ALTER TABLE public.custom_role_permissions ADD CONSTRAINT custom_role_permission_name CHECK (permission IN (
  'pages.tasks', 'pages.projects', 'pages.hackathons', 'pages.events', 'pages.certificates', 'pages.messages',
  'roles.manage', 'emails.view', 'audit.view', 'applications.review', 'planning.manage',
  'projects.create', 'projects.edit', 'projects.review_requests',
  'tasks.assign', 'tasks.manage',
  'events.manage', 'events.qr_host', 'certificates.issue',
  'hackathons.create',
  'blog.write', 'blog.publish', 'blog.moderate'
));

-- 2. Built-in roles that could manage roles keep seeing email templates.
INSERT INTO public.role_permission_defaults (role, permission) VALUES
  ('admin', 'emails.view'),
  ('leader', 'emails.view')
ON CONFLICT DO NOTHING;

-- 3. Custom roles that could manage roles keep their email template access too; it can now be
--    switched off on its own in the role builder.
INSERT INTO public.custom_role_permissions (role_id, permission)
SELECT role_id, 'emails.view'
FROM public.custom_role_permissions
WHERE permission = 'roles.manage'
ON CONFLICT DO NOTHING;
