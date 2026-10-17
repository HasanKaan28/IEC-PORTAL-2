# Üye portalını açma rehberi

Site yayında, ama üye portalı bir Supabase veritabanına bağlanana kadar bakım modunda kalır. Giriş, kayıt ve şifre sıfırlama sayfaları bu sırada bir bilgi kartı ve başvuru formu bağlantısı gösterir. Aşağıdaki adımlar portalı açar.

## 1. Supabase projesi oluştur

1. https://supabase.com adresinde yeni bir proje aç. Bölge olarak Frankfurt (eu-central-1) Saraybosna'ya en yakın olanıdır.
2. **Authentication > Providers > Email** altında e-posta ile girişi açık bırak ve **Confirm email** seçeneğini aç.
3. **Authentication > URL Configuration** altında:
   - **Site URL:** `https://iusengclub.vercel.app`
   - **Redirect URLs:**
     - `https://iusengclub.vercel.app/portal/giris`
     - `https://iusengclub.vercel.app/portal/sifre-yenile`
4. İsteğe bağlı ama önerilir (özel SMTP açıldıktan sonra): **Authentication > Emails > Templates > Reset password** şablonunda bağlantıyı şununla değiştir:

   ```html
   <a href="{{ .SiteURL }}/portal/sifre-yenile?token_hash={{ .TokenHash }}&type=recovery">Şifreni yenile</a>
   ```

   Varsayılan şablonla sıfırlama bağlantısı yalnızca isteğin yapıldığı tarayıcıda çalışır. Bu şablonla telefondan istenip bilgisayarda açılan bağlantı da çalışır.

## 2. Veritabanını kur

**SQL Editor** içinde bu dosyaları sırayla çalıştır:

1. `supabase/migrations/20261015000000_init_iec_schema.sql`
2. `supabase/migrations/20261017000000_security_hardening.sql`
3. `supabase/migrations/20261018000000_custom_roles.sql`
4. `supabase/migrations/20261019000000_default_member_role.sql`
5. `supabase/migrations/20261020000000_monthly_plan.sql` (Hakkımızda sayfasındaki aylık plan ve portaldaki Planlama sayfası)
6. `supabase/migrations/20261021000000_email_templates_permission.sql` (e-posta şablonları için ayrı yetki)
7. `supabase/migrations/20261022000000_rate_limits.sql` (giriş, kayıt, QR yoklama, yorum ve sertifika istekleri için ortak deneme sınırları)

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

## 6. Deneme sınırları ve spam koruması

Giriş ve kayıt sunucu üzerinden yapılır. Bu yüzden Supabase her ziyaretçiyi sitenin sunucu adresinden geliyor görür ve kendi IP sınırları ziyaretçileri ayırt edemez. Uygulama bu yüzden kendi sınırlarını uygular. Sayaçlar 7. dosyadaki `rate_limits` tablosunda tutulur ve tüm sunucu örnekleri aynı sayacı kullanır. Tabloya ham IP veya e-posta yazılmaz, yalnızca özetleri (SHA-256) yazılır, ve bir günden eski kayıtlar silinir. Tablo kurulmamışsa her sunucu örneği kendi bellek sayacını kullanır.

| İşlem | Sınır |
| --- | --- |
| Giriş | Hesap başına 15 dakikada 10, IP başına 10 dakikada 60 deneme |
| Kayıt | E-posta başına saatte 3, IP başına saatte 40 deneme |
| Şifre sıfırlama e-postası | E-posta başına saatte 3, IP başına saatte 40 istek |
| QR yoklama | Üye ve etkinlik başına 10 dakikada 10 deneme |
| Blog yorumu | Üye başına 5 dakikada 8 yorum |
| Sertifika doğrulama | IP başına 10 dakikada 60 istek |
| Sertifika PDF'i | IP başına 10 dakikada 20 istek |
| Mesaj | Üye başına dakikada sınırlı (uygulama içinde) |

IP sınırları geniş tutuldu, çünkü kampüs ağında birçok öğrenci aynı IP adresinden çıkar. Asıl koruma hesap başına sınırlardır.

Kayıt formunda iki bot tuzağı var: insanların görmediği gizli bir alan ve formun en az 2,5 saniyede doldurulması şartı. Gizli alanı dolduran bota başarılı mesajı gösterilir ama hesap açılmaz ve e-posta gitmez.

Supabase tarafında **Authentication > Rate Limits** altındaki saatlik e-posta sınırını kayıt dönemlerinde yükselt. Bot saldırısı görülürse **Authentication > Attack Protection** altından Cloudflare Turnstile ile CAPTCHA açılabilir. Bunun için Cloudflare hesabı ve forma bir doğrulama kutusu eklenmesi gerekir.

## Bilinen sınırlar

- Engelleme özelliği uygulama içinde çalışır ve servis anahtarı gerektirir.
- `npm audit` derleme araçlarında (PostCSS, Tailwind 3'ün alt paketleri) bilinen açıklar gösteriyor. Bunlar yalnızca derleme sırasında projenin kendi CSS dosyalarını işler, kullanıcı girdisine dokunmaz. Tamamen kapanmaları için Tailwind 4'e geçmek gerekiyor.
