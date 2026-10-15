#!/usr/bin/env python3
"""
Embed live clickable Linear Document links and direct copy-paste text inside Linear issues.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import get_issues, update_issue

issues = get_issues()

# 1. Update IUS-5 (Advisor Letter)
desc_ius5 = """### 🎯 Görev Amacı:
Kulübün arkasında duracak, FENS fakültesinden bir profesörü (Advisor) resmi olarak bağlamak.

### 📄 Doğrudan Açılabilir Resmi Belge:
👉 **[🔗 TIKLAYIN: FENS Akademik Danışman Resmi Davet Mektubu (Linear Dokümanı)](https://linear.app/ius-engineering-events/document/fens-akademik-danisman-resmi-davet-mektubu-8432eded09a6)**

---

### 📋 Yapılması Gereken Adım Adım Liste:
- [ ] **Hoca Seçimi:** FENS bünyesindeki (CS, SE, EE veya ME) öğrenci dostu 1-2 hocayı belirlemek.
- [ ] **Davet Mektubunu İletmek:** Yukarıdaki bağlantıdaki resmi mektubu hocanın adına göre düzenleyip e-posta göndermek veya odasını ziyaret etmek.
- [ ] **Kısa Sunum:** Hocaya kulübün vizyonunu aktarmak (*"Uygulamalı atölyeler, yapay zeka eğitimleri ve büyük hackathonlar düzenliyoruz"*).
- [ ] **İmza:** Hoca kabul ettiğinde SCC Başvuru Formundaki Advisor onay alanını imzalatmak.

---

### ✉️ Hazır E-Posta / Görüşme Taslağı (Kopyalamaya Hazır):
> **Dear Professor,**  
> On behalf of the founding student initiative of the **IUS Engineering Club**, we are writing to respectfully invite you to serve as our **Academic Faculty Advisor** for the 2026/2027 academic year.  
> We would be deeply honored to discuss this initiative with you in person at your office at your earliest convenience.  
> Respectfully yours,  
> **Hasan Kaan (Vice President) & Kaan Mete Şenyıldız (President)**  
> Faculty of Engineering and Natural Sciences (FENS)"""

# 2. Update IUS-6 (Activity Plan & Budget)
desc_ius6 = """### 🎯 Görev Amacı:
SCC'nin istediği faaliyet planı ve tahmini bütçe evraklarını eksiksiz hazır hale getirmek.

### 📄 Doğrudan Açılabilir Resmi Belgeler:
1. 👉 **[🔗 TIKLAYIN: SCC Yıllık Faaliyet Planı (2026/2027)](https://linear.app/ius-engineering-events/document/scc-yillik-faaliyet-plani-20262027-db3b4f5e5a05)**
2. 👉 **[🔗 TIKLAYIN: SCC Taslak Yıllık Bütçe Tahmini (5.000 KM)](https://linear.app/ius-engineering-events/document/scc-taslak-yillik-butce-tahmini-5000-km-127e6ed0a921)**

---

### 📋 Yapılması Gereken Adım Adım Liste:
- [ ] Yukarıdaki faaliyet planını incelemek (Güz: Lansman, AI Lab, IoT Lab, DevHack 2026 / Bahar: Summit, Gala).
- [ ] 5.000 KM dengeli bütçe tablosunu kontrol etmek (Şirket sponsorlukları ile finanse edilecek).
- [ ] Başvuru haftasında bu belgelerin çıktısını alıp başvuru poşet dosyasına eklemek."""

# 3. Update IUS-7 (Board Roster)
desc_ius7 = """### 🎯 Resmi Yönetim Kurulu Kadrosu:
SCC gereksinimlerine uygun resmi yönetim kurulu belirlenmiştir.

### 📄 Doğrudan Açılabilir Resmi Belge:
👉 **[🔗 TIKLAYIN: SCC 10 Kurucu Üye ve Yönetim Kurulu Listesi](https://linear.app/ius-engineering-events/document/scc-10-kurucu-uye-ve-yonetim-kurulu-listesi-f3bab5324d30)**
👉 **[🔗 TIKLAYIN: IEC Kulüp Tüzüğü (Constitution)](https://linear.app/ius-engineering-events/document/ieec-resmi-kulup-tuzugu-constitution-ab238dce240a)**

---

### 👥 Kesinleşen Kadro:
* **Club President (Başkan):** Kaan Mete Şenyıldız (2. Sınıf, No: 250302201)
* **Vice President (Başkan Yardımcısı):** Hasan Kaan (No: 250302195)
* **General Secretary (Genel Sekreter):** Mahmut İhsan Avcı (1. Sınıf, No: 250302233)
* **Treasurer (Sayman):** Bekir Enes Çokbekler (1. Sınıf, No: 250302229)"""

# 4. Update IUS-8 (Stealth 10 members)
desc_ius8 = """### 🤫 STRATEJİ: STEALTH MODE (SESSİZ VE BİREBİR)
⚠️ **Önemli Kural:** Kalabalık sınıf gruplarına duyuru atılmayacak! Üniversite resmi onayı öncesi dikkat çekmemek için **birebir (DM veya yüz yüze)** güvendiğimiz arkadaşlarımıza ulaşılarak 10 kişi tamamlanacaktır.

### 🔗 Paylaşım Linkleri:
* 📝 **[Yönetim/Kurucu Kayıt Formunu Aç](https://forms.gle/v8c85MgFUmVvpzTH6)**
* 💬 **[WhatsApp Grubuna Katıl](https://chat.whatsapp.com/LKMpyfm7K5R3F0rXezcXXN)**
* 📄 **[🔗 TIKLAYIN: 10 Kurucu Üye Takip Listesini Aç](https://linear.app/ius-engineering-events/document/scc-10-kurucu-uye-ve-yonetim-kurulu-listesi-f3bab5324d30)**

---

### 📋 Eylem Planı:
- [ ] FENS'ten güvendiğimiz 6 arkadaşımıza özelden yazıp form linkini iletmek.
- [ ] 10 kişiye ulaşıldığında isim ve öğrenci numaralarını listeye işlemek.
- [ ] Başvuru günü ıslak imzaları toplamak."""

updates = {
    "IUS-5": desc_ius5,
    "IUS-6": desc_ius6,
    "IUS-7": desc_ius7,
    "IUS-8": desc_ius8
}

for iss in issues:
    key = iss["identifier"]
    if key in updates:
        update_issue(iss["id"], {
            "description": updates[key]
        })
        print(f"[✓] {key} içine tıklanabilir doküman bağlantıları ve hazır metinler eklendi!")
