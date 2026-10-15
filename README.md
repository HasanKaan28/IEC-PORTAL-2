# 🚀 IUS Engineering Club (IEC) — Web Platform & Student Portal

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Platform-success?style=flat&logo=github)](https://hasankaan28.github.io/IEC-PORTAL-2/)
[![Open in GitHub Codespaces](https://img.shields.io/badge/Codespaces-1--Click%20Launch-blue?style=flat&logo=github)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=HasanKaan28/IEC-PORTAL-2)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/HasanKaan28/IEC-PORTAL-2)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5.28%20App%20Router-black?logo=next.js)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20Postgres%20%2B%20RLS-3ecf8e?logo=supabase)](https://supabase.com)

Welcome to the official web platform and student portal of the **IUS Engineering Club (IEC)** at the **International University of Sarajevo (IUS)**.

Explore our engineering initiatives, real-world project portfolios, interactive student portal with Linear-style Kanban tasks, 60-second dynamic TOTP QR attendance, certified vector PDF credentials, and real-time direct messaging.

🌐 **Canlı Web Sitesi (Live Website):** [https://hasankaan28.github.io/IEC-PORTAL-2/](https://hasankaan28.github.io/IEC-PORTAL-2/)

⚡ **Tek Tıkla Canlı Geliştirme Ortamı (Codespaces):** [Open in GitHub Codespaces](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=HasanKaan28/IEC-PORTAL-2) (Tarayıcıda anında çalışır)

---

## 📌 Temel Özellikler (Platform Highlights)

- **Gelişmiş Çift Tema Tasarım Sistemi (Dual-Theme)**:
  - Kamu sayfaları için sinematik koyu mod (`#030712`), WebGL ShaderGradient 3D görsel motoru.
  - Üye portalı için Linear / Vercel seviyesi ferah beyaz çalışma alanı (`#f8fafc`).
- **Üye Portalı & Görev Yönetimi (`/portal/gorevler`)**:
  - Linear tarzı Kanban panosu ve Liste görünümü, dinamik öncelik ve durum filtreleme.
  - Görev içi yorum akışı, üye atama ve durum güncelleme çekmecesi.
- **Kriptografik TOTP QR Yoklama & Doğrulama**:
  - Projeksiyon ekranları için her 60 saniyede bir otomatik dönen dinamik HMAC-SHA256 QR kodu (`/portal/admin/etkinlikler/[id]/yoklama`).
  - Katılımcı check-in modalı ve konfeti kutlaması.
  - `pdf-lib` ile anlık vektör A4 PDF sertifika üretimi, LinkedIn "Add to Profile" entegrasyonu ve herkese açık doğrulama portalı (`/dogrula`).
- **Birebir Mesajlaşma & Bildirim Merkezi (`/portal/mesajlar`)**:
  - Split-view mesajlaşma ekranı, Supabase Realtime anlık veri iletimi.
  - Sıfır harici varlık (zero-asset) Web Audio API osilatör sentezleyicisi (`soundEffects.playMessageSound()`) ile mikro ses efektleri.
  - Discord tarzı interaktif profil kartları ve güvenlik menüsü.
- **PWA & SEO 95+ Standartları**:
  - Dinamik `sitemap.xml`, `robots.txt`, Web App Manifest (`manifest.webmanifest`), Vercel tarzı özel 404 & 500 sayfaları.
  - Çift dil (TR varsayılan, EN hazır) dil seçici (`LanguageSwitcher`).

---

## 🛠️ Yerel Kurulum & Çalıştırma (Local Development)

```bash
# 1. Depoyu klonlayın
git clone https://github.com/HasanKaan28/IEC-PORTAL-2.git
cd IEC-PORTAL-2

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açarak portala erişebilirsiniz.

### Demo / Offline Mod
Herhangi bir canlı Supabase anahtarı girmeden projeyi tam olarak test etmek için tarayıcı çerezinize `iec_demo_session=true` ekleyebilir veya doğrudan `/portal/giris` sayfasındaki hızlı geçiş butonunu kullanabilirsiniz.

---

## 📂 Dizin Yapısı (Architecture)

```plaintext
├── .devcontainer/         # 1-tıkla GitHub Codespaces yapılandırması
├── .github/workflows/     # GitHub Actions CI & GitHub Pages deploy hattı
├── public/                # Vektör SVG uygulama ikonları, manifest, ve statik varlıklar
├── src/
│   ├── app/
│   │   ├── (public)/      # /, /projeler, /blog, /hakkimizda, /basvuru, /dogrula, /kvkk, /gizlilik, /cerezler
│   │   ├── portal/        # /portal (dashboard), /portal/gorevler, /portal/projeler, /portal/hackathon,
│   │   │                  # /portal/etkinlikler, /portal/sertifikalarim, /portal/mesajlar, /portal/admin
│   │   ├── api/           # /api/applications, /api/certificates/[code]/pdf
│   │   ├── sitemap.ts     # Dinamik sitemap üretimi
│   │   ├── robots.ts      # Arama motoru bot izinleri
│   │   ├── manifest.ts    # PWA Web App manifest
│   │   ├── not-found.tsx  # Özel 404 sayfası
│   │   └── error.tsx      # Özel 500 hata yakalayıcısı
│   ├── components/        # UI bileşenleri (Navbar, Footer, Kanban, QR Yoklama, Dialoglar)
│   ├── lib/               # Supabase API, RBAC yetki matrisi, ses sentezleyici, PDF motoru
│   └── styles/            # Tailwind CSS ve global tasarım değişkenleri
└── supabase/migrations/   # 23 Postgres tablosu, RLS güvenlik politikaları ve tohum verileri
```

---

## 🏛️ Yönetim & Temsil
Bu platform **International University of Sarajevo (IUS)** Mühendislik Kulübü için resmi olarak hazırlanmıştır.
