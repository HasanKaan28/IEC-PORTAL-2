# IUS Engineering Club — Gelecek Öğrenci Portalı Mimari Planı (Portal Vision Blueprint)

Bu doküman, IUS Engineering Club'ın ilerleyen dönemde hayata geçireceği **Öğrenci & Üye Portal Platformu**'nun (`IEC Student Hub / Portal`) vizyonunu, mimari modüllerini ve teknik yol haritasını özetler.

---

## 1. Portalin Temel Amacı ve Vizyonu

Öğrencilerin yalnızca pasif katılımcı olmak yerine, kendi hesaplarıyla giriş yapıp kulübün tüm imkanlarından tek merkezden faydalandığı, modern bir **Mühendislik Öğrenci İşletim Sistemi**:
- Üniversite hesabı (`@student.ius.edu.ba` veya Google OAuth) ile kayıt ve giriş.
- Tüm geçmiş etkinlik ve sertifikalarını tek ekranda görme (**Sertifika Kasası / Digital Wallet**).
- Yaklaşan atölye, konferans ve hackathonlara tek tıkla kayıt ve kişisel QR giriş bileti.
- Proje ekipleri kurma, takım arkadaşı arama (DevHack & Donanım projeleri).

---

## 2. Temel Modüller ve Kullanıcı Deneyimi

```
┌────────────────────────────────────────────────────────────────────────┐
│                   IEC STUDENT PORTAL (Dashboard)                       │
├──────────────────┬─────────────────────────────┬───────────────────────┤
│ 👤 Öğrenci Profili│ 📜 Sertifika Kasası (Locker)│ 🎟️ Etkinlik & Biletler│
│ - Ad Soyad       │ - AI Workshop (Doğrulandı)  │ - Yaklaşan Atölyeler  │
│ - Bölüm (CS/EE)  │ - Marshmallow Challenge     │ - 1-Tıkla Kayıt (RSVP)│
│ - Beceri Etiketleri│ - [PDF İndir] [LinkedIn Ekle]│ - Kişisel Giriş QR'ı  │
├──────────────────┴─────────────────────────────┴───────────────────────┤
│ 🛠️ Proje & Takım Havuzu (DevHack)               💡 Fikir & Mentorluk   │
│ - "DevHack için 1 Backend + 1 Tasarımcı Aranıyor" - Fikir Havuzuna Öneri│
│ - Başvuru ve Ekip Eşleşmesi                     - Akademik Soru-Cevap  │
└────────────────────────────────────────────────────────────────────────┘
```

### Modül 1: Kimlik & Öğrenci Profili (Authentication & Profile)
- **Giriş**: IUS e-postası veya Google Auth.
- **Profil**:
  - Bölüm (CSE, SE, EE, ME, IE) ve Sınıf bilgisi.
  - İlgi alanları: Yapay Zeka, Web Geliştirme, Robotik, Gömülü Sistemler, IoT.
  - GitHub ve LinkedIn profil bağlantıları.

### Modül 2: Sertifika Kasası (Digital Credential Locker)
- Öğrencinin bugüne kadar katıldığı tüm kulüp etkinliklerinin sertifikaları otomatik olarak profiline işlenir.
- **Özellikler**:
  - Yüksek çözünürlüklü vektör PDF'i dilediği an tekrar indirme.
  - Tek tıkla LinkedIn profiline ekleme.
  - Paylaşılabilir genel profil linki (Örn: `portal.ius.edu.ba/u/ahmed-hadzimurati`).

### Modül 3: Etkinlikler, RSVP & Dijital QR Bilet
- Yaklaşan etkinlikler listelenir (kontenjan durumları, konuşmacılar, program akışı).
- Öğrenci "Kayıt Ol" butonuna basınca telefonuna kişisel bir **Giriş QR Kodu** üretilir.
- Etkinlik kapısında yönetim ekibi telefonu okuttuğu anda yoklama alınır ve etkinlik bitiminde sertifika öğrencinin profiline ve mailine otomatik aktarılır.

### Modül 4: Proje & Hackathon Takım Eşleştirme (DevHack Matchmaking)
- Öğrenciler kendi projelerini veya DevHack takımlarını tanıtabilir:
  - *"Örnek: IUS PowerHub projemiz için 1 Elektronik (EE) öğrencisi arıyoruz."*
- Becerilere göre filtreleme yaparak multidisipliner takımlar kurulmasını sağlar.

### Modül 5: Kampüs Kaynak & Donanım Rezervasyonu
- Kulübün temin edeceği 3D yazıcı, Arduino/Raspberry Pi kitleri veya laboratuvar test ekipmanları için online randevu/rezervasyon sistemi.

---

## 3. Önerilen Modern Teknoloji Yığını (Tech Stack)

| Katman | Önerilen Teknoloji | Neden? |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (React) / Vite** | Hızlı, modern, responsive, zengin UI ve SEO uyumu. |
| **Tasarım / UI** | **Vanilla CSS + Glassmorphism / Cyberpunk Design** | Kulübün Deep Space kurumsal kimliğine uygun ultra-premium görünüm. |
| **Backend & DB** | **Supabase (PostgreSQL + Auth + Storage)** | %100 Ücretsiz başlangıç katmanı, yerleşik Google/Email Auth, Row Level Security, gerçek zamanlı bildirimler. |
| **Hosting** | **Vercel / Cloudflare Pages** | Sınırsız global CDN, sıfır sunucu maliyeti, GitHub entegrasyonu. |
| **Sertifika Entegrasyonu** | **Mevcut IEC AutoCert Engine** | Bugün kurduğumuz motor doğrudan REST API veya Webhook olarak bu portala bağlanabilir. |

---

## 4. Uygulama Adımları (Gelecek Yol Haritası)

1. **Faz 1 (Mevcut Durum)**: Google Forms + Google Sheets + IEC AutoCert Engine + GitHub Pages Doğrulama Portalı (Hafif, maliyetsiz, çalışır durumda).
2. **Faz 2 (Portala Geçiş)**: Supabase veritabanı kurulumu, öğrenci kayıt/giriş ekranı ve bireysel profil sayfası.
3. **Faz 3 (Tam Entegrasyon)**: Etkinlik QR check-in, sertifika kasası ve DevHack takım kurma arayüzü.
