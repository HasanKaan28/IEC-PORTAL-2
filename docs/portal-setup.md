# Üye portalını açma rehberi

Site yayında, ama üye portalı bir Supabase veritabanına bağlanana kadar bakım modunda kalır. Giriş ve kayıt sayfaları bu sırada bir bilgi kartı ve başvuru formu bağlantısı gösterir. Aşağıdaki adımlar portalı açar.

## 1. Supabase projesi oluştur

1. https://supabase.com adresinde yeni bir proje aç. Bölge olarak Frankfurt (eu-central-1) Saraybosna'ya en yakın olanıdır.
2. **Authentication > Providers > Email** altında e-posta ile girişi açık bırak ve **Confirm email** seçeneğini aç.
3. **Authentication > URL Configuration** altında:
   - **Site URL:** `https://iec-portal-2.vercel.app`
   - **Redirect URLs:** `https://iec-portal-2.vercel.app/portal/giris`

## 2. Veritabanını kur

**SQL Editor** içinde bu iki dosyayı sırayla çalıştır:

1. `supabase/migrations/20261015000000_init_iec_schema.sql`
2. `supabase/migrations/20261017000000_security_hardening.sql`

İkinci dosya şunları yapar:

- Yalnızca `@student.ius.edu.ba` adreslerinin kayıt olmasına izin verir. Bu kontrol veritabanında yapıldığı için uygulama atlanarak da aşılamaz.
- Her yeni hesap için profil ve "member" rolünü otomatik oluşturur.
- Etkinlik QR anahtarını, üyelerin e-posta ve telefonlarını ve sertifika listesini doğrudan erişime kapatır.
- Görev, katılım isteği ve mesaj tablolarındaki yetki açıklarını kapatır.

## 3. Vercel ortam değişkenleri

Vercel'de **Project > Settings > Environment Variables** altına şunları ekle (Production ve Preview):

| Değişken | Nereden alınır |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Aynı sayfadaki `anon` `public` anahtar |
| `SUPABASE_SERVICE_ROLE_KEY` | Aynı sayfadaki `service_role` anahtar. Gizli tut, hiçbir yerde paylaşma. |
| `SUPER_ADMIN_EMAIL` | İlk yöneticinin `@student.ius.edu.ba` adresi |
| `QR_HMAC_SECRET` | En az 32 karakterlik rastgele bir değer (aşağıdaki komut) |

Rastgele QR anahtarı üretmek için:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`NEXT_PUBLIC_SITE_URL` daha önce eski GitHub Pages adresine ayarlandıysa sil ya da `https://iec-portal-2.vercel.app` yap.

Değişkenleri ekledikten sonra Vercel'de **Deployments > Redeploy** ile siteyi yeniden yayınla.

## 4. İlk yönetici

1. `SUPER_ADMIN_EMAIL` adresiyle `/portal/kayit` sayfasından kayıt ol.
2. Gelen kutundaki doğrulama bağlantısına tıkla.
3. `/portal/giris` sayfasından giriş yap. Süper yönetici rolü bu ilk girişte verilir.
4. Diğer üyelere **Yönetici Konsolu > Roller** sayfasından rol ver.

## Bilinen sınırlar

- Şifre sıfırlama akışı henüz yok. Gerekirse Supabase panelinden kullanıcıya sıfırlama e-postası gönderilebilir.
- Yanlış QR kodu deneme sınırı her sunucu örneğinde ayrı tutulur. Kötüye kullanım görülürse ortak bir sınırlayıcı eklenmeli.
- Engelleme özelliği uygulama içinde çalışır ve servis anahtarı gerektirir.
