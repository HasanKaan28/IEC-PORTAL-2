# IUS Engineering Club (IEC) — Official Web Platform & Member Portal 🚀
**International University of Sarajevo (IUS) | Faculty of Engineering and Natural Sciences (FENS)**

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=HasanKaan28/IEC-PORTAL)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/HasanKaan28/IEC-PORTAL)

> **Canlı Tarayıcıda Doğrudan Çalıştır**: Yukarıdaki **"Open in GitHub Codespaces"** butonuna basarak kurulum yapmadan, doğrudan tarayıcınızda çalışan tam Next.js 15 dev sunucusuna erişebilirsiniz!

---

## ⚡ Özellikler & Modüller

- **Modern Çift Tema (Dual Theme)**:
  - Kamu sayfaları için sinematik koyu mod (`#030712`), WebGL ShaderGradient 3D arka planı.
  - Üye portalı için Linear / Vercel seviyesi ferah açık mod (`#f8fafc`).
- **Üye Portalı & Görev Yönetimi (`/portal/gorevler`)**:
  - Linear tarzı sürükle-bırak Kanban panosu ve Liste görünümü.
  - Görev içi yorumlar, durum/öncelik filtreleme ve anlık atama.
- **Dinamik TOTP QR Yoklama & Sertifika Doğrulama**:
  - 60 saniyede bir dönen kriptografik TOTP QR projeksiyon ekranı (`/portal/admin/etkinlikler/[id]/yoklama`).
  - `pdf-lib` ile anlık vektör A4 PDF sertifika üretimi ve LinkedIn "Add to Profile" entegrasyonu.
  - Herkese açık sorgulama kapısı (`/dogrula`).
- **Anlık Birebir Mesajlaşma (DM) & Bildirimler (`/portal/mesajlar`)**:
  - Split-view anlık sohbet, Supabase Realtime ve Web Audio API mikro ses efektleri.
- **Güvenlik & RBAC**:
  - Supabase PostgreSQL 23 tablo, %100 Row Level Security (RLS) politikaları.
  - Zorunlu KVKK rıza loglama (`consent_logs`).
- **PWA & SEO 95+**:
  - Dinamik `sitemap.xml`, `robots.txt`, Web App Manifest (`manifest.webmanifest`), Vercel tarzı özel 404 & 500 sayfaları.
  - Çift dil (TR ve EN) ve dil seçici (`LanguageSwitcher`). İlk ziyarette tarayıcısı Türkçe olana Türkçe, diğerlerine İngilizce açılır; seçilen dil çerezde hatırlanır.

---

## 🛠️ Yerel Kurulum & Çalıştırma

### Gereksinimler
- Node.js 18+ veya 20+
- npm veya pnpm

```bash
# 1. Depoyu klonlayın
git clone https://github.com/HasanKaan28/IEC-PORTAL.git
cd IEC-PORTAL

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

### Demo / Offline Mod
Herhangi bir canlı Supabase anahtarı girmeden projeyi tam olarak test etmek için tarayıcı çerezinize `iec_demo_session=true` ekleyebilir veya doğrudan `/portal/giris` sayfasındaki hızlı geçiş butonunu kullanabilirsiniz.

---

## 🏛️ Mimari & Rotalar

```
src/
├── app/
│   ├── (public)/          # /, /projeler, /blog, /hakkimizda, /basvuru, /dogrula, /kvkk, /gizlilik, /cerezler
│   ├── portal/            # /portal (dashboard), /portal/gorevler, /portal/projeler, /portal/hackathon,
│   │                      # /portal/etkinlikler, /portal/sertifikalarim, /portal/mesajlar, /portal/admin
│   ├── api/               # /api/applications, /api/certificates/[code]/pdf
│   ├── sitemap.ts         # Dinamik sitemap üretimi
│   ├── robots.ts          # Bot izinleri
│   ├── manifest.ts        # PWA Web App manifest
│   ├── not-found.tsx      # Özel 404 sayfası
│   └── error.tsx          # Özel 500 hata yakalayıcısı
├── components/            # Public, Portal ve Paylaşılan UI bileşenleri
├── lib/                   # Supabase istemcileri, RBAC matrisi, ses efektleri, e-posta şablonları
└── styles/                # Tailwind CSS ve global tasarım değişkenleri
```

---

## 📄 Lisans
Bu proje International University of Sarajevo (IUS) Engineering Club (IEC) adına geliştirilmiştir.
