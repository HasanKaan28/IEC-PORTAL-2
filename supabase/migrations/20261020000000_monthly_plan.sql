-- ==============================================================================
-- IEC PORTAL - MONTHLY PLAN (2026-10-20)
-- Run after 20261019000000_default_member_role.sql. Safe to run more than once.
-- The About page shows a one-month plan split into four weeks. Members holding planning.manage
-- edit it in the portal (Management > Planning). Everyone may read it; only the server writes it,
-- with the service role, after checking the caller's permission.
-- ==============================================================================

-- 1. The new permission joins the allowed list; admins and club leaders get it by default.
ALTER TABLE public.custom_role_permissions DROP CONSTRAINT IF EXISTS custom_role_permission_name;
ALTER TABLE public.custom_role_permissions ADD CONSTRAINT custom_role_permission_name CHECK (permission IN (
  'pages.tasks', 'pages.projects', 'pages.hackathons', 'pages.events', 'pages.certificates', 'pages.messages',
  'roles.manage', 'audit.view', 'applications.review', 'planning.manage',
  'projects.create', 'projects.edit', 'projects.review_requests',
  'tasks.assign', 'tasks.manage',
  'events.manage', 'events.qr_host', 'certificates.issue',
  'hackathons.create',
  'blog.write', 'blog.publish', 'blog.moderate'
));

INSERT INTO public.role_permission_defaults (role, permission) VALUES
  ('admin', 'planning.manage'),
  ('leader', 'planning.manage')
ON CONFLICT DO NOTHING;

-- 2. Plan settings (a single row) and its four weeks.
CREATE TABLE IF NOT EXISTS public.monthly_plan (
  id boolean PRIMARY KEY DEFAULT true,
  month_start date NOT NULL DEFAULT (date_trunc('month', now()))::date,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT monthly_plan_single_row CHECK (id)
);

CREATE TABLE IF NOT EXISTS public.monthly_plan_weeks (
  week smallint PRIMARY KEY,
  title_tr text NOT NULL,
  title_en text,
  body_tr text,
  body_en text,
  status text NOT NULL DEFAULT 'auto',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT monthly_plan_week_number CHECK (week BETWEEN 1 AND 4),
  CONSTRAINT monthly_plan_week_title CHECK (char_length(btrim(title_tr)) BETWEEN 1 AND 120),
  CONSTRAINT monthly_plan_week_title_en CHECK (title_en IS NULL OR char_length(title_en) <= 120),
  CONSTRAINT monthly_plan_week_body CHECK (body_tr IS NULL OR char_length(body_tr) <= 600),
  CONSTRAINT monthly_plan_week_body_en CHECK (body_en IS NULL OR char_length(body_en) <= 600),
  CONSTRAINT monthly_plan_week_status CHECK (status IN ('auto', 'planned', 'active', 'done'))
);

ALTER TABLE public.monthly_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_plan_weeks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone reads the monthly plan" ON public.monthly_plan;
CREATE POLICY "Everyone reads the monthly plan" ON public.monthly_plan
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Everyone reads the monthly plan weeks" ON public.monthly_plan_weeks;
CREATE POLICY "Everyone reads the monthly plan weeks" ON public.monthly_plan_weeks
  FOR SELECT TO anon, authenticated USING (true);

-- Nobody writes these tables directly: there are no write policies, and the grants say so too.
REVOKE INSERT, UPDATE, DELETE ON public.monthly_plan, public.monthly_plan_weeks FROM anon, authenticated;
GRANT SELECT ON public.monthly_plan, public.monthly_plan_weeks TO anon, authenticated;

-- 3. Start from the club's current plan items so the About page is never empty.
INSERT INTO public.monthly_plan (id) VALUES (true) ON CONFLICT DO NOTHING;

INSERT INTO public.monthly_plan_weeks (week, title_tr, title_en, body_tr, body_en) VALUES
  (1, 'Akademik danışman ve SKS kaydı', 'Faculty advisor and club registration',
      'Prof. Dr. Leila Miller''ın danışmanlığında, Form F252 ve 12 kurucu üyenin imzasıyla Öğrenci İşleri''ne (SKS/SCC) başvuru.',
      'Application to Student Affairs (SCC) with Form F252, signed by 12 founding members, under the supervision of Prof. Dr. Leila Miller.'),
  (2, 'Linear ve tanışma etkinliği', 'Linear onboarding and kick-off event',
      'Üyelerin Linear''a eklenmesi ve IUS Büyük Amfi''de Marshmallow Challenge ile açılış etkinliği.',
      'Adding members to Linear and an opening Marshmallow Challenge in the IUS Grand Amphitheatre.'),
  (3, 'Haftalık atölyeler ve kampüs konuşmaları', 'Weekly workshops and campus talks',
      'FENS laboratuvarlarında yapay zekâ, gömülü sistemler ve yerel dil modelleri üzerine atölyeler.',
      'Workshops in the FENS labs on AI, embedded systems and locally run language models.'),
  (4, 'DevHack 2027 ve Mühendislik Zirvesi', 'DevHack 2027 and the Engineering Summit',
      'Üniversiteler arası 24 saatlik hackathon ve Saraybosna''daki teknoloji şirketlerinin katılacağı TechSummit 2027.',
      'A 24-hour inter-university hackathon and TechSummit 2027 with tech companies from Sarajevo.')
ON CONFLICT (week) DO NOTHING;
