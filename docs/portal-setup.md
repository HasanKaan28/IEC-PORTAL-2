# Üye portalını açma rehberi

Site yayında, ama üye portalı bir Supabase veritabanına bağlanana kadar bakım modunda kalır. Giriş ve kayıt sayfaları bu sırada bir bilgi kartı ve başvuru formu bağlantısı gösterir. Aşağıdaki adımlar portalı açar.

## 1. Supabase projesi oluştur

1. https://supabase.com adresinde yeni bir proje aç. Bölge olarak Frankfurt (eu-central-1) Saraybosna'ya en yakın olanıdır.
2. **Authentication > Providers > Email** altında e-posta ile girişi açık bırak ve **Confirm email** seçeneğini aç.
3. **Authentication > URL Configuration** altında:
   - **Site URL:** `https://iusengclub.vercel.app`
   - **Redirect URLs:** `https://iusengclub.vercel.app/portal/giris`

## 2. Veritabanını kur

**SQL Editor** içinde bu iki dosyayı sırayla çalıştır:

1. `supabase/migrations/20261015000000_init_iec_schema.sql`
2. `supabase/migrations/20261017000000_security_hardening.sql`
3. `supabase/migrations/20261018000000_custom_roles.sql`
4. `supabase/migrations/20261019000000_default_member_role.sql`
5. `supabase/migrations/20261020000000_monthly_plan.sql` (Hakkımızda sayfasındaki aylık plan ve portaldaki Planlama sayfası)
6. `supabase/migrations/20261021000000_email_templates_permission.sql` (e-posta şablonları için ayrı yetki)

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

`NEXT_PUBLIC_SITE_URL` Vercel'de `https://iusengclub.vercel.app` olarak ayarlı. Paylaşım önizlemeleri, site haritası ve e-posta bağlantıları bu adresi kullanır; alan adı değişirse bu değeri de güncelle. Eski `iec-portal-2.vercel.app` adresi yeni adrese kalıcı olarak (308) yönlendirilir.

Değişkenleri ekledikten sonra Vercel'de **Deployments > Redeploy** ile siteyi yeniden yayınla.

## 4. İlk yönetici

1. `SUPER_ADMIN_EMAIL` adresiyle `/portal/kayit` sayfasından kayıt ol.
2. Gelen kutundaki doğrulama bağlantısına tıkla.
3. `/portal/giris` sayfasından giriş yap. Süper yönetici rolü bu ilk girişte verilir.
4. Diğer üyelere **Yönetici Konsolu > Roller** sayfasından rol ver.

## 5. E-posta gönderimi ve kulüp şablonu

Supabase'in kendi e-posta servisi yalnızca proje ekibindeki adreslere e-posta gönderir. Öğrencilere doğrulama ve şifre sıfırlama e-postası gitmesi için kendi SMTP servisini bağla. Şablonlar da ancak bundan sonra düzenlenebilir.

1. Kulübün bir Gmail hesabında iki adımlı doğrulamayı aç. Sonra **Google Hesabı > Güvenlik > Uygulama şifreleri** altından bir uygulama şifresi oluştur. Gmail günde yaklaşık 500 alıcıya izin verir.
2. Supabase'de **Authentication > Emails > SMTP Settings** altında **Enable custom SMTP** seçeneğini aç:
   - **Sender email:** kulübün Gmail adresi
   - **Sender name:** `IUS Engineering Club`
   - **Host:** `smtp.gmail.com`, **Port:** `465`
   - **Username:** kulübün Gmail adresi, **Password:** uygulama şifresi
3. **Authentication > Rate Limits** altında saatlik e-posta sınırını kontrol et. Kayıt dönemlerinde yükseltmen gerekebilir.
4. **Authentication > Emails > Templates > Confirm sign up** şablonunda:
   - **Subject:** `IEC Portal hesabını doğrula / Verify your IEC Portal account`
   - **Body:** `supabase/templates/confirm-signup.html` dosyasının tüm içeriği

## Bilinen sınırlar

- Şifre sıfırlama akışı henüz yok. Gerekirse Supabase panelinden kullanıcıya sıfırlama e-postası gönderilebilir.
- Yanlış QR kodu deneme sınırı her sunucu örneğinde ayrı tutulur. Kötüye kullanım görülürse ortak bir sınırlayıcı eklenmeli.
- Engelleme özelliği uygulama içinde çalışır ve servis anahtarı gerektirir.
