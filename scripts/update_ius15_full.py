#!/usr/bin/env python3
"""
Update Linear issue IUS-15 description to accurately reflect that
Muhammed Efe Ural is the actual Social Media & Instagram Content Lead (and co-leads sponsorships),
while Bakir Bašić is the statutory PR Lead on official SCC paperwork.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import graphql, get_issues

issues = get_issues()
ius15 = next((i for i in issues if i["identifier"] == "IUS-15"), None)
if not ius15:
    print("[-] IUS-15 not found")
    sys.exit(1)

mutation = """
mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
  issueUpdate(id: $id, input: $input) {
    success
    issue {
      identifier
      title
      state { name }
    }
  }
}
"""

description = """### 🎪 Etkinlik Amacı & Konsept:
IUS Engineering Club (IEC) resmi kuruluş lansmanı ve tüm FENS öğrencileri için ilk büyük tanışma toplantısı! Klasik ve sıkıcı amfi sunumları yerine, dünya çapında (Stanford, Google, TED) uygulanan **Marshmallow Challenge** ile mühendislik ruhunu aksiyonla başlatıyoruz.

> ⏳ **Tarih & Saat:** **HENÜZ BELLİ DEĞİL (TBA)**. Kulüp resmi başvurusu ve amfi rezervasyonunun tamamlanmasının ardından ders programlarına en uygun saatte duyurulacaktır. Afişte tarih ve saat alanı şablon olarak bırakılacaktır.

---

### 📋 Etkinlik Mimarisi & Marshmallow Challenge Detayları:
- [ ] **Açılış & Vizyon (10 Dk):** **IEC Yönetim Kurulu Üyeleri ile Birlikte** kulüp dönem hedefleri ve DevHack 2027 vizyonunun ortak aktarılması; Prof. Dr. Leila Miller (Akademik Danışman) selamlama konuşması.
- [ ] **Karma Takım Dağılımı (15 Dk):** Girişte rastgele renkli kartlarla 4-5 kişilik karma masalar oluşturulması (Yazılım, Makine, Elektrik, Boşnak ve Türk öğrenciler karışık).
- [ ] **⚡ 18 Dakika Marshmallow Challenge:**
  - **Malzemeler (Takım Başına):** 20 çiğ spagetti çubuğu, 1m kağıt bant, 1m pamuk ip, 1 adet bütün marshmallow.
  - **Kural:** Kule serbest ayakta durmalı (free-standing), marshmallow tek parça halinde en tepede olmalı!
  - **Mühendislik Dersi:** Kindergarten vs MBA paradoksu — laf kalabalığı yerine hızlı iterasyon, kafes kiriş (truss) statiği ve stres testi.
- [ ] **Moderatör & Salon Akışı:** **IEC Yönetim Kurulu & Kurucu Ekip (Kurul Üyeleri ile Birlikte)** — Geri sayım, kurallar, masalar arası canlı denetim ve enerji yönetimi.
- [ ] **🎨 Sosyal Medya, Instagram & Afiş (Fiili Lider):** **Muhammed Efe Ural** (Sosyal Medya & Sponsorluk Lideri) — Resmi etkinlik afişi tasarımı (Tarih/saat ve Instagram kullanıcı adı TBA şablonlu), Instagram lansmanı (hesap açıldığında), anlık story ve reels paylaşımları, şirket ikram/sponsorlukları.
- [ ] **📢 Resmi PR & Kampüs İletişimi:** **Bakir Bašić** (Resmi PR Lead - SCC Evrak Temsilcisi) — Üniversite duyuru panoları, afişlerin fiziksel asımı, resmi SCC ve Boşnak öğrenci iletişimi.
- [ ] **Jüri Ölçümü & Ödüller:** Prof. Dr. Leila Miller ve **Yönetim Kurulu Üyeleri** tarafından şerit metreyle en yüksek kulenin ölçülmesi; *Apex Tower*, *Best Architecture* ve *Epic Crash* ödülleri.
- [ ] **Lojistik & Malzeme:** Bekir Enes Çokbekler (Sayman) tarafından malzeme kitlerinin (~24 KM bütçe) hazırlanması.
- [ ] **Networking & Komite Kayıtları:** Çay/kahve eşliğinde yeni üyelerin teknik komitelere yönlendirilmesi.

---

🔗 **İlgili Operasyonel Belge:**
👉 [**📋 Detaylı Etkinlik Kılavuzu: roadmap/MARSHMALLOW_CHALLENGE_KICKOFF.md**](<https://github.com/HasanKaan28/ius-engineering-events/blob/main/roadmap/MARSHMALLOW_CHALLENGE_KICKOFF.md>)
👉 [**🎨 Efe Ural Afiş & Sosyal Medya Rehberi: roadmap/POSTER_AND_SOCIAL_MEDIA_BRIEF.md**](<https://github.com/HasanKaan28/ius-engineering-events/blob/main/roadmap/POSTER_AND_SOCIAL_MEDIA_BRIEF.md>)
"""

res = graphql(mutation, {
    "id": ius15["id"],
    "input": {
        "title": "🎪 [TBA / Tarih Belirlenecek] IEC Büyük Tanışma Toplantısı: The Marshmallow Challenge (Icebreaker & Spagetti Kuleleri)",
        "description": description
    }
})
print("[✓] Linear IUS-15 Güncellendi (TBA):", res)

