#!/usr/bin/env python3
"""
Update all Linear issues with granular step-by-step checklists, action plans,
and reflect the 2nd-year President resolution.
"""

from linear_ops import get_issues, update_issue

issues = get_issues()

# 1. Update IUS-7: Çekirdek Ekip Rol Dağılımı (2. Sınıf Başkan Çözümü)
desc_ius7 = """### 🎯 Görev Amacı:
2. sınıf öğrencisi bulunduğu için resmi SCC Yönetim Kurulu kadrosunu resmileştirmek ve ekiple teyit etmek.

### 📋 Yapılması Gereken Adım Adım Liste:
1. **[ ] Bilgi Temini:** Bulunan 2. sınıf arkadaşımızın resmi bilgilerini (Tam Adı, Öğrenci No, Bölüm, Telefon, E-posta) almak.
2. **[ ] Resmi Dilekçe Eşleşmesi:**
   * **Club President (Resmi Başkan):** Bulunan 2. sınıf öğrencisi *(SCC 2. sınıf şartını sağlar)*.
   * **Vice President & Founder (Fiili Kaptan):** Hasan Kaan *(Operasyon ve tüm strateji lideri)*.
   * **General Secretary (Genel Sekreter):** Bekir Enes Çokbekler.
   * **Treasurer & Finance (Sayman / Mali İşler):** Mahmut İhsan Avcı.
   * **Board Member (Yönetim Kurulu):** Kaan Mete Şenyıldız.
3. **[ ] Hızlı Senkronizasyon (15 dk):** Ekiple kampüste veya WhatsApp üzerinden buluşup rolleri ve hedefleri teyit etmek.
4. **[ ] Doküman Güncellemesi:** 'templates/SCC_FOUNDING_10_MEMBERS.md' dosyasına bilgileri işlemek."""

# 2. Update IUS-5: FENS Akademik Danışman
desc_ius5 = """### 🎯 Görev Amacı:
Kulübün arkasında duracak, FENS fakültesinden bir profesörü (Advisor) resmi olarak bağlamak.

### 📋 Yapılması Gereken Adım Adım Liste:
1. **[ ] Hoca Listesi:** FENS bünyesindeki (CS, SE, EE veya ME) öğrenci dostu 1-2 hocayı belirlemek.
2. **[ ] Resmi Davet:** 'templates/ACADEMIC_ADVISOR_INVITATION.md' mektubunu hocanın adına göre düzenleyip e-posta göndermek veya odasını ziyaret etmek.
3. **[ ] Sunum (3 Dakika):** Hocaya kısaca vizyonu aktarmak: *"Hocam biz IUS'ta aktif atölyeler ve hackathonlar düzenleyecek Engineering Events kulübünü kuruyoruz, danışman hocamız olmanız bizi onurlandırır."*
4. **[ ] İmza:** Hoca kabul ettiğinde SCC Başvuru Formundaki Advisor onay imzasını almak."""

# 3. Update IUS-6: SCC Faaliyet Planı ve Taslak Bütçe
desc_ius6 = """### 🎯 Görev Amacı:
SCC'nin istediği faaliyet planı ve tahmini bütçe evraklarını eksiksiz hazır hale getirmek.

### 📋 Yapılması Gereken Adım Adım Liste:
1. **[ ] Faaliyet Planı İnceleme:** 'templates/SCC_ANNUAL_ACTIVITY_PLAN.md' dosyasındaki Güz ve Bahar dönemi etkinliklerini incelemek (Lansman, AI Lab, IoT Lab, DevHack 2026).
2. **[ ] Taslak Bütçe İnceleme:** 'templates/SCC_DRAFT_BUDGET.md' dosyasındaki 5.000 KM dengeli bütçeyi kontrol etmek (Gelir: Şirket sponsorlukları / Gider: Afiş, pizza, ikram, ödüller).
3. **[ ] Çıktı Alma:** Başvuru haftasında bu iki belgenin renkli/temiz çıktısını alıp başvuru dosyasına eklemek."""

# 4. Update IUS-8: En Az 6 Yeni Kurucu Üye (10 Kişilik Liste)
desc_ius8 = """### 🎯 Görev Amacı:
SCC kuralı: "The club must be founded by at least 10 IUS students." Listeyi 4'ten 10'a çıkarmak.

### 📋 Yapılması Gereken Adım Adım Liste:
1. **[ ] Form Dağıtımı:** Google Form kayıt linkini FENS'teki mühendislik sınıf gruplarına ve arkadaşlarımıza iletmek.
2. **[ ] Hedef:** En az 6 yeni öğrencinin İsim, Öğrenci No, Bölüm ve Telefon bilgilerini toplamak.
3. **[ ] Roster Güncelleme:** 'templates/SCC_FOUNDING_10_MEMBERS.md' tablosundaki 5-10 arası boşlukları bu öğrencilerle doldurmak.
4. **[ ] İmza Toplama:** Başvuru günü bu 10 kişinin dilekçeye imzalarını almak."""

# 5. Update IUS-9: Promotion Day Stant ve Afiş Hazırlığı
desc_ius9 = """### 🎯 Görev Amacı:
24 Kasım başvuru sonrasındaki 2 hafta içinde yapılacak "Student Club Promotion Day" için hazırlık.

### 📋 Yapılması Gereken Adım Adım Liste:
1. **[ ] Sosyal Medya & Tasarım:** 'pr_and_branding/SOCIAL_MEDIA_LAUNCH_KIT.md' üzerinden Instagram ve LinkedIn sayfalarını canlandırmak.
2. **[ ] Stant Materyalleri:** Kampüs girişine koymak için 1 adet roll-up banner ve masaya koyulacak kulüp broşürü tasarlamak.
3. **[ ] QR Kodlu Katılım:** Stanta gelen öğrencilerin telefonla okutup anında kulübe/WhatsApp grubuna katılabileceği QR kod oluşturmak.
4. **[ ] Canlı Demo:** Stantta ilgi çekecek küçük bir donanım/kod demosu (örn. laptopta dönen robotik simülasyon veya AI demo) hazırlamak."""

updates = {
    "IUS-7": {"title": "Resmi Yönetim Kurulu Kadrosu (2. Sınıf Başkan Çözümü)", "desc": desc_ius7},
    "IUS-5": {"title": "FENS Akademik Danışman Resmi Daveti ve Onayı", "desc": desc_ius5},
    "IUS-6": {"title": "SCC Yıllık Faaliyet Planı ve Taslak Bütçe Dosyalaması", "desc": desc_ius6},
    "IUS-8": {"title": "SCC 10 Öğrenci Kuralı: Kalan 6 Kurucu Üyeyi Tamamlama", "desc": desc_ius8},
    "IUS-9": {"title": "Promotion Day: Kampüs Standı, Afiş ve QR Kod Hazırlığı", "desc": desc_ius9}
}

for iss in issues:
    key = iss["identifier"]
    if key in updates:
        update_issue(iss["id"], {
            "title": updates[key]["title"],
            "description": updates[key]["desc"]
        })
        print(f"[✓] {key} başarıyla güncellendi!")
