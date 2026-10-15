#!/usr/bin/env python3
"""
Sync updated 5 Board + 10 General Members roster into Linear Document and Tasks.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import graphql, get_issues, update_issue

workspace_root = Path(__file__).resolve().parent.parent

# 1. Read updated markdown
members_doc_path = workspace_root / "templates" / "SCC_FOUNDING_10_MEMBERS.md"
with open(members_doc_path, "r", encoding="utf-8") as f:
    members_content = f.read()

# 2. Update Linear Document
doc_mutation = """
mutation UpdateDoc($id: String!, $input: DocumentUpdateInput!) {
  documentUpdate(id: $id, input: $input) {
    success
    document {
      id
      title
      slugId
    }
  }
}
"""

res_doc = graphql(doc_mutation, {
    "id": "8be26629-83d3-4c7a-a7a0-66ebb1f51480",
    "input": {
        "title": "SCC Executive Board & Founding Members Roster (2026/2027)",
        "content": members_content
    }
})
print("[✓] Linear Dokümanı Güncellendi:", res_doc)

# 3. Update Linear Issue IUS-7 (Yönetim Kurulu Kadrosu - PR Lead Eksik)
desc_ius7 = """### 🎯 Resmi Yönetim Kurulu Kadrosu (5 Kişilik Heyet):
SCC gereksinimlerine göre 5 kişilik yönetim kadrosu belirlenmektedir. Şu an **4 pozisyon onaylı, sadece PR Lead eksiktir**:

* 👑 **Club President (Başkan):** Kaan Mete Şenyıldız (2. Sınıf, No: 250302201)
* 🚀 **Vice President (Başkan Yardımcısı):** Hasan Kaan (1. Sınıf, No: 250302195)
* 📝 **General Secretary (Genel Sekreter):** Mahmut İhsan Avcı (1. Sınıf, No: 250302233)
* 💰 **Treasurer (Sayman):** Bekir Enes Çokbekler (1. Sınıf, No: 250302229)
* 📣 **PR & Communications Lead:** ⚠️ **EKSİK / AÇIK POZİSYON** (Özel olarak atanmadığı sürece formdan gelen herkes normal Üyedir).

---

### 📄 Doğrudan Açılabilir Resmi Belge:
👉 [**🔗 TIKLAYIN: SCC Yönetim Kurulu ve Üye Listesi**](<https://linear.app/ius-engineering-events/document/scc-10-kurucu-uye-ve-yonetim-kurulu-listesi-f3bab5324d30>)
👉 [**🔗 TIKLAYIN: IEC Kulüp Tüzüğü (Constitution)**](<https://linear.app/ius-engineering-events/document/ieec-resmi-kulup-tuzugu-constitution-ab238dce240a>)"""

# 4. Update Linear Issue IUS-8 (10 Normal Üye & Stealth Mode)
desc_ius8 = """### 🤫 STRATEJİ: STEALTH MODE (SESSİZ VE BİREBİR)
⚠️ **Önemli Kural:** Üniversite resmi onayı öncesi dikkat çekmemek için kalabalık sınıf gruplarına duyuru atılmayacak, **birebir (DM veya yüz yüze)** güvendiğimiz arkadaşlarımıza ulaşılarak 10 üye tamamlanacaktır.
📌 **Rol Kuralı:** Özel olarak "PR Lead" atanmadığı sürece formdan gelen herkes doğrudan **Normal Üye (Member)** statüsündedir.

### 📊 Mevcut Üye Durumu: 10 / 10 Normal Üye Tamamlandı (HEDEF BAŞARILDI! 🎯)
* [x] **1. Bilal Yusuf Şimşek** (1. Sınıf, Bilgisayar Müh., No: 250302196) — Üye
* [x] **2. Nazlıcan Cebeci** (1. Sınıf, CSE, No: 250302243) — Üye
* [x] **3. Muhammed Emin** (2. Sınıf, FENS, No: 250302247) — Üye
* [x] **4. Emin Efe Duman** (1. Sınıf, FENS, No: 250302211) — Üye
* [x] **5. Bakir** (1. Sınıf, FENS, No: 260302030) — Üye
* [x] **6. Ömer Arif Açıkel** (1. Sınıf, FENS, No: 250302232) — Üye
* [x] **7. Mert Çınar Atalay** (1. Sınıf, FENS, No: 250302162) — Üye
* [x] **8. Ferit Enes Seymenliler** (2. Sınıf, FENS, No: 240302180) — Üye
* [x] **9. Hüseyin Talha Seymenliler** (2. Sınıf, FENS, No: 240302179) — Üye
* [x] **10. Muhammed Efe Ural** (2. Sınıf, FENS, No: 240302169) — Üye

---

### 🔗 Paylaşım Linkleri:
* 📝 [**Yönetim/Kurucu Kayıt Formunu Aç**](<https://forms.gle/v8c85MgFUmVvpzTH6>)
* 💬 [**WhatsApp Grubuna Katıl**](<https://chat.whatsapp.com/LKMpyfm7K5R3F0rXezcXXN>)
* 📊 [**Google Sheets Canlı Yanıtlar Tablosu**](<https://docs.google.com/spreadsheets/d/1pLeiQpBNSfDFPGa5IqLbSGoz0Z2Lm3Olu-mq3XZhzbQ/edit?usp=sharing>)
* 📄 [**🔗 TIKLAYIN: 10 Kurucu Üye Takip Listesini Aç**](<https://linear.app/ius-engineering-events/document/scc-10-kurucu-uye-ve-yonetim-kurulu-listesi-f3bab5324d30>)"""

issues = get_issues()
for iss in issues:
    if iss["identifier"] == "IUS-7":
        update_issue(iss["id"], {
            "title": "Resmi Yönetim Kurulu Kadrosu (Sadece PR Lead Eksik)",
            "description": desc_ius7
        })
        print("[✓] IUS-7 güncellendi (PR Lead eksik olarak netleştirildi).")
    elif iss["identifier"] == "IUS-8":
        update_issue(iss["id"], {
            "title": "🎉 SCC Üye Listesi: 10/10 Kurucu Normal Üye Kotası Tamamlandı!",
            "description": desc_ius8
        })
        print("[✓] IUS-8 güncellendi (10/10 Üye Tamamlandı).")
