-- ==============================================================================
-- IUS ENGINEERING CLUB (IEC) - COMPLETE POSTGRES SCHEMA & RLS POLICIES
-- Phase 0: Database Architecture, Security & Seed Data
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES & ENUMS
DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM (
    'super_admin',
    'admin',
    'leader',
    'project_lead',
    'task_manager',
    'blog_author',
    'member'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status_enum AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status_enum AS ENUM ('concept', 'in_progress', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status_enum AS ENUM ('todo', 'in_progress', 'in_review', 'done');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_priority_enum AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE post_status_enum AS ENUM ('draft', 'published');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE request_status_enum AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. CORE IDENTITY & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  department TEXT,
  class_year TEXT,
  bio TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  phone TEXT,
  hide_phone BOOLEAN DEFAULT true NOT NULL,
  hide_email BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. ROLES (RBAC) TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role_enum NOT NULL DEFAULT 'member',
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_user_role UNIQUE(user_id, role)
);

-- HELPER FUNCTIONS FOR RBAC IN RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role_enum)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND (role = _role OR role = 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin')
  );
$$;

-- 5. LEGAL CONSENT & KVKK AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_version TEXT NOT NULL,
  consented_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- 6. SYSTEM AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. MEMBERSHIP APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  class_year TEXT NOT NULL,
  statement TEXT NOT NULL,
  status application_status_enum DEFAULT 'pending' NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. PROJECTS & SHOWCASE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_tr TEXT NOT NULL,
  title_en TEXT NOT NULL,
  tagline_tr TEXT NOT NULL,
  tagline_en TEXT NOT NULL,
  category_tr TEXT NOT NULL,
  category_en TEXT NOT NULL,
  problem_tr TEXT,
  problem_en TEXT,
  solution_tr TEXT,
  solution_en TEXT,
  specs JSONB DEFAULT '[]'::jsonb,
  accent_color TEXT DEFAULT '#2563eb' NOT NULL,
  difficulty INT DEFAULT 3 NOT NULL,
  budget TEXT,
  status project_status_enum DEFAULT 'concept' NOT NULL,
  is_flagship BOOLEAN DEFAULT false NOT NULL,
  is_featured BOOLEAN DEFAULT true NOT NULL,
  cover_image TEXT,
  github_url TEXT,
  demo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. PROJECT MEMBERS
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Member' NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_project_member UNIQUE(project_id, user_id)
);

-- 10. PROJECT JOIN REQUESTS
CREATE TABLE IF NOT EXISTS public.project_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status request_status_enum DEFAULT 'pending' NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewer_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 11. TASKS MANAGEMENT (KANBAN & LIST)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status_enum DEFAULT 'todo' NOT NULL,
  priority task_priority_enum DEFAULT 'medium' NOT NULL,
  due_date TIMESTAMPTZ,
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 12. TASK COMMENTS
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 13. TASK ATTACHMENTS (SUPABASE STORAGE REFS)
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT,
  uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 14. BLOG POSTS
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status post_status_enum DEFAULT 'draft' NOT NULL,
  reading_time_min INT DEFAULT 3 NOT NULL,
  tags TEXT[] DEFAULT '{}'::text[],
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 15. BLOG LIKES
CREATE TABLE IF NOT EXISTS public.blog_likes (
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

-- 16. BLOG COMMENTS
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 17. HACKATHONS
CREATE TABLE IF NOT EXISTS public.hackathons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_country TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  application_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}'::text[],
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 18. HACKATHON TEAMS
CREATE TABLE IF NOT EXISTS public.hackathon_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_open BOOLEAN DEFAULT true NOT NULL,
  looking_for TEXT[] DEFAULT '{}'::text[],
  leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 19. HACKATHON TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.hackathon_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.hackathon_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_team_member UNIQUE(team_id, user_id)
);

-- 20. HACKATHON JOIN REQUESTS
CREATE TABLE IF NOT EXISTS public.hackathon_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.hackathon_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status request_status_enum DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 21. EVENTS & ROTATING QR CODES
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  venue TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  qr_signing_secret TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 22. EVENT ATTENDANCES (QR CHECK-IN)
CREATE TABLE IF NOT EXISTS public.event_attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_attendance UNIQUE(event_id, user_id)
);

-- 23. CERTIFICATES & VERIFICATION
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  certificate_code TEXT NOT NULL UNIQUE,
  pdf_url TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 24. DIRECT MESSAGING (REALTIME)
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 25. IN-APP NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users can read profiles; users can update their own profile; admins can update all
CREATE POLICY "Profiles readable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- User Roles: Read by authenticated; managed by admins
CREATE POLICY "Roles readable by authenticated" ON public.user_roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Roles managed by admins" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Consent Logs: Users can insert their own consent log; read own; admins can view all
CREATE POLICY "Users insert own consent" ON public.consent_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own consent" ON public.consent_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Audit Logs: Viewable only by admins
CREATE POLICY "Audit logs readable by admins" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Audit logs insertable by authenticated" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id OR public.is_admin(auth.uid()));

-- Applications: Anyone can submit an application (anon); admins review
CREATE POLICY "Anyone can submit application" ON public.applications
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins read and review applications" ON public.applications
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Projects: Publicly readable; writable by admins / leaders
CREATE POLICY "Projects readable by all" ON public.projects
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Projects manageable by admins or leaders" ON public.projects
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'leader'));

-- Project Members: Readable by all; manageable by project lead or admin
CREATE POLICY "Project members readable by all" ON public.project_members
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Project members managed by leaders or admins" ON public.project_members
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'leader'));

-- Project Join Requests: Users can view their own; leaders can view project requests
CREATE POLICY "Users view own project join requests" ON public.project_join_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'leader'));

CREATE POLICY "Users can create join request" ON public.project_join_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Leaders can update join requests" ON public.project_join_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'leader'));

-- Tasks: Readable by authenticated members; writable by task managers or assignees
CREATE POLICY "Tasks readable by authenticated" ON public.tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Tasks manageable by task managers or admins" ON public.tasks
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'task_manager') OR
    creator_id = auth.uid() OR
    assignee_id = auth.uid()
  );

-- Task Comments & Attachments
CREATE POLICY "Task comments readable by authenticated" ON public.task_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users insert task comments" ON public.task_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Task attachments readable by authenticated" ON public.task_attachments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users insert task attachments" ON public.task_attachments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploader_id);

-- Blog Posts: Published posts readable by all; drafts readable by author or admin
CREATE POLICY "Published blog posts readable by all" ON public.blog_posts
  FOR SELECT TO anon, authenticated USING (status = 'published' OR author_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Blog authors can write posts" ON public.blog_posts
  FOR ALL TO authenticated USING (
    author_id = auth.uid() AND public.has_role(auth.uid(), 'blog_author')
    OR public.is_admin(auth.uid())
  );

-- Blog Likes: Anyone can see like counts; authenticated can toggle like
CREATE POLICY "Likes readable by all" ON public.blog_likes
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users toggle own like" ON public.blog_likes
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Blog Comments: Publicly readable; authenticated can write; admin/moderator can delete
CREATE POLICY "Comments readable by all" ON public.blog_comments
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can write comments" ON public.blog_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users or admins can moderate comments" ON public.blog_comments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Hackathons: Readable by all; manageable by leaders/admins
CREATE POLICY "Hackathons readable by all" ON public.hackathons
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Hackathons manageable by leaders or admins" ON public.hackathons
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'leader'));

-- Hackathon Teams & Members: Readable by all; manageable by team leader
CREATE POLICY "Teams readable by all" ON public.hackathon_teams
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can create team" ON public.hackathon_teams
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Team leader can update team" ON public.hackathon_teams
  FOR UPDATE TO authenticated USING (auth.uid() = leader_id OR public.is_admin(auth.uid()));

CREATE POLICY "Team members readable by all" ON public.hackathon_team_members
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Team leader can manage members" ON public.hackathon_team_members
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.hackathon_teams WHERE id = team_id AND leader_id = auth.uid()) OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Team requests managed by users and leaders" ON public.hackathon_join_requests
  FOR ALL TO authenticated USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.hackathon_teams WHERE id = team_id AND leader_id = auth.uid()) OR
    public.is_admin(auth.uid())
  );

-- Events: Readable by all; manageable by admins/leaders
CREATE POLICY "Events readable by all" ON public.events
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Events managed by leaders" ON public.events
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'leader'));

-- Event Attendances: Users can see own attendance; admins see all
CREATE POLICY "Users see own attendance" ON public.event_attendances
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Attendance recorded for self or by admin" ON public.event_attendances
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Certificates: Public verification by code; users see own certificates
CREATE POLICY "Public certificate verification" ON public.certificates
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins or event hosts issue certificates" ON public.certificates
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'leader'));

-- Direct Messages: Only sender and receiver can read/write
CREATE POLICY "Direct messages between participants" ON public.direct_messages
  FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Send direct message" ON public.direct_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receiver mark as read" ON public.direct_messages
  FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);

-- Notifications: Only target user can read and update
CREATE POLICY "Notifications private to user" ON public.notifications
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ==============================================================================
-- INITIAL SEED DATA (5 FLAGSHIP IEC PROJECTS)
-- ==============================================================================

INSERT INTO public.projects (
  slug,
  title_tr,
  title_en,
  tagline_tr,
  tagline_en,
  category_tr,
  category_en,
  problem_tr,
  problem_en,
  solution_tr,
  solution_en,
  specs,
  accent_color,
  difficulty,
  budget,
  status,
  is_flagship,
  is_featured,
  cover_image
) VALUES
(
  'powerbank-station',
  'IUS PowerHub (Akıllı Powerbank İstasyonu)',
  'IUS PowerHub (Smart Campus Powerbank Station)',
  'Öğrenci kartı (RFID) ile tek dokunuşta taşınabilir kampüs enerjisi.',
  'One-tap portable energy powered by IUS Student RFID IDs.',
  'Donanım & IoT Kampüs İnovasyonu',
  'Hardware & IoT Campus Innovation',
  'Amfilerde, kütüphanede ve kafeteryada priz yetersizliği sebebiyle öğrencilerin ders aralarında cihazlarının şarjsız kalması ve priz arama karmaşası.',
  'Shortage of accessible wall outlets across lecture halls, the library, and cafeterias leads to depleted student devices and disrupted study sessions.',
  'Öğrencilerin IUS kartını okutarak otomatik şarj olan powerbank alabileceği, her blokta giriş katına yerleştirilecek 3 adet otonom manyetik şarj istasyonu.',
  'Students tap their university RFID card to instantly release the fullest powerbank from smart magnetic charging docks deployed across campus building lobbies.',
  '[{"label": {"tr": "Mimari", "en": "Architecture"}, "value": {"tr": "ESP32 / Raspberry Pi IoT Gateway", "en": "ESP32 / Raspberry Pi IoT Gateway"}}, {"label": {"tr": "Protokol", "en": "Protocol"}, "value": {"tr": "MQTT & WebSocket Telemetry", "en": "MQTT & WebSocket Telemetry"}}]'::jsonb,
  '#06b6d4',
  5,
  'Tahmini 400+ KM (Şirket Sponsorluğu Destekli)',
  'in_progress',
  true,
  true,
  'assets/powerbank_station_hero.jpg'
),
(
  'dining-menu-system',
  'IUS Dining App (Yemekhane Menü & Geri Bildirim)',
  'IUS Dining App (Cafeteria Menu & Feedback Hub)',
  'Günlük yemekhane menüsü, kalori takibi ve anlık öğrenci geri bildirim platformu.',
  'Daily cafeteria menu, nutrition tracking, and real-time student dining satisfaction ratings.',
  'Yazılım & Kampüs Servisi',
  'Software & Campus Service',
  'Yemekhane menüsünün öğrencilere düzenli ulaşmaması, yemek kalitesi hakkında anlık geri bildirim mekanizmasının eksikliği.',
  'Students frequently lack clear visibility into daily cafeteria lunch items and have no direct channel to submit meal feedback.',
  'Web ve mobil uyumlu PWA uygulaması ile haftalık menü gösterimi, alerjen filtreleme ve yemekhane yönetimine anonim puanlama kanalı.',
  'A lightweight responsive PWA showing weekly menus, nutritional values, and verified student rating dashboards.',
  '[{"label": {"tr": "Yığın", "en": "Stack"}, "value": {"tr": "Next.js + Supabase + Tailwind", "en": "Next.js + Supabase + Tailwind"}}]'::jsonb,
  '#10b981',
  2,
  '0 KM (Kulüp Açık Kaynak Geliştirmesi)',
  'in_progress',
  false,
  true,
  'assets/dining_app_hero.jpg'
),
(
  'devhack-2027',
  'DevHack 2027 (IUS 24 Saatlik Mühendislik Hackathonu)',
  'DevHack 2027 (IUS 24-Hour Engineering Hackathon)',
  'Saraybosna genelinde üniversite öğrencilerini buluşturan 24 saatlik kodlama maratonu.',
  'Sarajevo-wide 24-hour sprint uniting computer science, electrical, and mechanical students.',
  'Amiral Gemisi Hackathon',
  'Flagship Hackathon',
  'Mühendislik öğrencilerinin teorik dersler haricinde endüstri standardı gerçek sorunlara multidisipliner takımlarla çözüm üretme pratiğinin az olması.',
  'Engineering students need intense collaborative opportunities to transform theoretical classroom knowledge into production prototypes.',
  'FENS laboratuvarlarında gerçekleşecek, mentorluk seansları, sponsor jüri üyeleri ve canlı sunumlarla desteklenen 24 saatlik hackathon.',
  'An intensive on-campus weekend hackathon featuring industry mentors, corporate problem statements, and real-time project judging.',
  '[{"label": {"tr": "Format", "en": "Format"}, "value": {"tr": "24 Saat Kesintisiz Maraton", "en": "24-Hour Non-stop Sprint"}}]'::jsonb,
  '#f59e0b',
  4,
  '700 KM (Tier 1 Şirket Sponsorlukları Destekli)',
  'concept',
  true,
  true,
  'assets/hackathon_event_hero.jpg'
),
(
  'ai-prompt-labs',
  'AI Prompt & Evaluation Labs (Uygulamalı LLM İstasyonu)',
  'AI Prompt & Evaluation Labs (Hands-on LLM Lab)',
  'Modern büyük dil modelleri ve yerel AI ajanları ile uygulamalı haftalık atölye dizisi.',
  'Weekly hands-on laboratory sessions exploring LLM orchestration, evaluation pipelines, and local AI agent tooling.',
  'Yapay Zekâ & Makine Öğrenimi',
  'Artificial Intelligence & ML',
  'Yapay zekâ araçlarının öğrenciler tarafından yalnızca yüzeysel kullanılması; prompt mühendisliği ve LLM mimarisinin derinlemesine bilinmemesi.',
  'Students often use generative AI superficially without understanding orchestration, token dynamics, or local deployment pipelines.',
  'Haftalık kodlama laboratuvarları: RAG mimarileri, Ollama ile yerel model optimizasyonu ve üretim ortamı AI pipeline geliştirme.',
  'Weekly hands-on coding labs covering retrieval augmented generation (RAG), local model deployment, and production agent frameworks.',
  '[{"label": {"tr": "Altyapı", "en": "Infrastructure"}, "value": {"tr": "PyTorch / Ollama / Next.js", "en": "PyTorch / Ollama / Next.js"}}]'::jsonb,
  '#8b5cf6',
  3,
  '100 KM (Materyal & Sunucu Giderleri)',
  'concept',
  false,
  true,
  'assets/ai_lab_hero.jpg'
),
(
  'ius-techsummit-2027',
  'IUS Engineering Summit 2027 (Kariyer & Teknoloji Zirvesi)',
  'IUS Engineering Summit 2027 (Career & Tech Summit)',
  'Saraybosna teknoloji ekosistemi ve uluslararası mühendislik liderlerini IUS kampüsünde buluşturan zirve.',
  'Flagship annual conference bringing tech leaders and Bosnian engineering innovators to the IUS Amphitheater.',
  'Konferans & Kariyer Zirvesi',
  'Conference & Career Summit',
  'Öğrencilerin Saraybosna ve bölgesel IT/Mühendislik firmalarıyla doğrudan staj ve kariyer iletişimi kurabilme fırsatlarının sınırlı olması.',
  'Engineering students face networking friction connecting with top software, automotive, and automation employers in Bosnia.',
  'IUS Büyük Amfide düzenlenecek panel oturumları, şirket fuar stantları, CV inceleme masaları ve teknik keynote sunumları.',
  'A high-profile annual summit hosted in the main amphitheater featuring corporate booths, technical keynotes, and speed interviewing.',
  '[{"label": {"tr": "Lokasyon", "en": "Location"}, "value": {"tr": "IUS Büyük Amfi & B-Blok Fuaye", "en": "IUS Main Amphitheater & Foyer"}}]'::jsonb,
  '#ec4899',
  4,
  '500 KM (Şirket Stant & Sponsorluk Geliri)',
  'concept',
  true,
  true,
  'assets/engineering_summit_hero.jpg'
)
ON CONFLICT (slug) DO UPDATE SET
  title_tr = EXCLUDED.title_tr,
  title_en = EXCLUDED.title_en,
  tagline_tr = EXCLUDED.tagline_tr,
  tagline_en = EXCLUDED.tagline_en,
  category_tr = EXCLUDED.category_tr,
  category_en = EXCLUDED.category_en,
  problem_tr = EXCLUDED.problem_tr,
  problem_en = EXCLUDED.problem_en,
  solution_tr = EXCLUDED.solution_tr,
  solution_en = EXCLUDED.solution_en,
  specs = EXCLUDED.specs,
  accent_color = EXCLUDED.accent_color,
  difficulty = EXCLUDED.difficulty,
  budget = EXCLUDED.budget,
  status = EXCLUDED.status,
  is_flagship = EXCLUDED.is_flagship,
  is_featured = EXCLUDED.is_featured,
  cover_image = EXCLUDED.cover_image,
  updated_at = now();
