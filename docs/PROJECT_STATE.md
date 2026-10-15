# IEC Platform — Project State

## 1. Tech Stack
- **Framework**: Next.js 15 (App Router), React 19, TypeScript 5
- **Styling & UI**: Tailwind CSS (Dual theme: dark cinematic public + light portal), shadcn/ui, Framer Motion, Lucide
- **Visuals**: ShaderGradient v2 (`@shadergradient/react`, `@react-three/fiber` v9, `three`) with reduced-motion fallback
- **Backend**: Supabase (PostgreSQL, Auth with email verify, RLS mandatory, Realtime DMs, Storage)
- **Deployment**: Vercel ready

## 2. Directory Architecture
```
ius-engineering-events/
├── src/
│   ├── app/
│   │   ├── (public)/          # /, /projeler, /hakkimizda, /basvuru, /blog, /dogrula, /kvkk, /gizlilik, /cerezler
│   │   ├── portal/            # /portal (SIS/Linear dashboard), /portal/giris, /portal/kayit, /portal/profil, /portal/admin
│   │   ├── api/applications/  # Zod-validated application submission endpoint
│   │   └── layout.tsx         # Root layout with Geist/Inter typography
│   ├── components/
│   │   ├── public/            # Navbar, HeroSection, ProjectsShowcase, About, BlogTeaser, CookieBanner, Footer
│   │   ├── portal/            # PortalHeaderUserMenu, portal layout elements
│   │   └── shared/            # DiscordProfileCard (roles, projects, privacy contact buttons)
│   ├── lib/                   # Supabase clients (browser/server), auth-actions, RBAC matrix, utils, i18n
│   ├── middleware.ts          # Session protection for /portal routes
│   └── styles/globals.css     # Design tokens (dark cinematic public vs light portal)
├── supabase/migrations/       # Postgres DDL, RLS policies, seed dataset
└── docs/                      # Architectural docs & PROJECT_STATE.md
```

## 3. Completed Phases
- **[x] Faz 0: Foundation**: Next.js 15 & React 19 App Router setup, dual-theme tokens, RBAC matrix, Postgres schema with 23 tables + RLS.
- **[x] Faz 1: Public Site**: 3D ShaderGradient hero, 5-project showcase + catalog, about page with advisor/roster/roadmap, `/basvuru` with Zod validation, Cookie banner, and legal pages.
- **[x] Faz 2: Auth, KVKK onayı, profil**: Supabase Auth integration, mandatory KVKK consent + `consent_logs` logging, `/portal/giris`, `/portal/kayit`, Next.js session middleware, user profile editor (`/portal/profil`), and clickable Discord-style profile card with privacy toggles.
- **[x] Faz 3: Rol sistemi + admin paneli**: `/portal/admin` yönetim konsolu, kullanıcı listesi, anlık rol atama/kaldırma (`super_admin`, `admin`, `leader`...), `audit_logs` denetim kaydı, başvuru inceleme ekranı (`/portal/admin/basvurular`), ve breadcrumb tab navigation.
- **[x] Faz 4: Blog sistemi**: Blog listesi & arama/kategori/etiket filtreleme, detay sayfası (okuma süresi, 4 sosyal paylaşım butonu, beğeni sayacı), iç içe yorumlar (oturum zorunlu, şikayet etme), çift panelli Markdown stüdyosu (`/portal/admin/blog/yeni` & düzenleme), yorum moderasyonu (`/portal/admin/blog/yorumlar`), RSS 2.0 akışı (`/feed.xml`) ve OpenGraph meta etiketleri.
- **[x] Faz 5: Portal dashboard + görevler**: Üye ana panosu dinamik özet metrikleri (`/portal`), Linear tarzı Kanban panosu ve Liste görünümü (`/portal/gorevler`), durum/öncelik/proje/sorumlu filtreleri, görev detay slide-over çekmecesi, görev içi yorum akışı, ve lider/admin yeni görev oluşturma/atama modalı.
- **[x] Faz 6: Projeler & Hackathon takımları**: Kulüp projeleri vitrini (`/portal/projeler`), temiz üye yapısı (mock kullanıcılar ve sahte projeler temizlendi, kullanıcılar kendileri ekler), dinamik "Yeni Proje Ekle" modalı (`CreateProjectModal`), proje lideri onay çekmecesi (`project_join_requests`), DevHack hackathon ilanları (`/portal/hackathon`), takım kurma ve katılma modalı (`hackathon_teams`).
- **[x] Faz 7: Etkinlikler & Sertifika sistemi**: Etkinlik kataloğu & kayıt (`/portal/etkinlikler`), 60 saniyede bir dönen dinamik TOTP QR projeksiyon ekranı (`/portal/admin/etkinlikler/[id]/yoklama`), üye check-in modalı & konfeti kutlaması, `pdf-lib` yüksek çözünürlüklü A4 vektör PDF sertifika motoru (`/api/certificates/[code]/pdf`), LinkedIn 'Add to Profile' URL entegrasyonu, üye sertifika panosu (`/portal/sertifikalarim`) ve herkese açık doğrulama sayfası (`/dogrula`).
- **[x] Faz 8: İletişim, Bildirimler & DM**: Birebir anlık mesajlaşma split-view ekranı (`/portal/mesajlar`), Supabase Realtime bağlantısı, okunmamış rozetleri, sıfır-bağımlılık Web Audio API sentezleyici ses efektleri (`soundEffects.playMessageSound()`), profil kartı görüntüleme & şikayet/engelleme modalı, portal header zil popover bildirim merkezi (`PortalNotificationBell`), ve 4 kurumsal HTML e-posta şablonu stüdyosu (`/portal/admin/eposta-onizleme`).
- **[x] Faz 9: Son cila, performans & SEO**: PWA Web App Manifest (`manifest.webmanifest`, `manifest.json`, modern SVG çip ikonu), dinamik `sitemap.ts` (statik + yayınlanan blog yazıları), `robots.ts` kuralları, Vercel/Linear estetiğinde özel 404 (`not-found.tsx`) ve 500 (`error.tsx`, `global-error.tsx`), Twitter/OpenGraph meta etiketleri, ve `LanguageSwitcher` (TR/EN çift dil hazır altyapı).

## 4. Database Schema (23 Tables, All RLS Protected)
- **Identity & RBAC**: `profiles`, `user_roles` (7 roles: super_admin to member), `consent_logs` (KVKK), `audit_logs`
- **Applications & Projects**: `applications`, `projects` (temiz gerçek kulüp projeleri + dinamik ekleme), `project_members`, `project_join_requests`
- **Work & Community**: `tasks` (Kanban/List), `task_comments`, `task_attachments`, `blog_posts`, `blog_likes`, `blog_comments`
- **Hackathons & Teams**: `hackathons`, `hackathon_teams`, `hackathon_team_members`, `hackathon_join_requests`
- **Events & Credentials**: `events`, `event_attendances` (60s dynamic QR), `certificates` (unique verify code)
- **Realtime**: `direct_messages`, `notifications`

## 5. Architectural Decisions
- Session middleware guards all `/portal` paths, redirecting unauthenticated requests to `/portal/giris?redirect=...`.
- Privacy-first Discord profile card dynamically checks `hide_phone` and `hide_email` before rendering contact triggers.
- Multi-tier auth fallback: Production Supabase Auth with development demo session support for instant offline evaluation.
- Clean separation between pure server read queries (`hackathon-queries.ts`, `project-queries.ts`, `event-queries.ts`, `message-queries.ts`) and Server Action mutations.
- 60-second rotating TOTP with HMAC-SHA256 windowing prevents attendance proxy fraud on projection screens.
- Web Audio API custom synthesizers provide zero-asset instant sound feedback for notifications and direct messages.
- Full PWA compliance and dynamic SEO indexing via Next.js App Router metadata routes.

## 6. Known Gaps
- Live Supabase project credentials in `.env.local` need to be connected by user for production email confirmations.

## 7. Next Step
- **Lansman & Prod Dağıtımı (Launch & Deployment)**: Tüm 9 faz eksiksiz tamamlandı! Vercel / GitHub Pages üretim dağıtımı ve canlı alan adı eşleştirmesi.
