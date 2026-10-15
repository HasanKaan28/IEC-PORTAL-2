#!/usr/bin/env python3
"""
Reorder all Linear issues strictly according to:
1. Chronological order (Zaman sırasına göre)
2. Priority (Öncelik sırasına göre)
3. Linear manual sortOrder (ASCENDING: smallest on top)
4. Matching Due Dates and sequential numbering.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import graphql, get_issues, get_users

users = get_users()
user_map = {u["name"]: u["id"] for u in users}
hasan_id = user_map.get("Hasan Kaan")
mahmut_id = user_map.get("Mahmut ihsan avcı")
bekir_id = user_map.get("Bekir Enes")

mutation = """
mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
  issueUpdate(id: $id, input: $input) {
    success
    issue {
      identifier
      title
      priority
      dueDate
      sortOrder
    }
  }
}
"""

# Let's map issues by identifier
issues = get_issues()
issue_by_id = {iss["identifier"]: iss for iss in issues}

# 1. TODO ISSUES (Ön Hazırlık / Açılış Öncesi Görevler)
# Sıra:
# Adım 1: IUS-7 (10 Ekim - Yönetim Kurulu Kadrosu)
# Adım 2: IUS-5 (19 Ekim - FENS Akademik Danışman)
# Adım 3: IUS-8 (31 Ekim - 10 Öğrenci Birebir İletişim)
# Adım 4: IUS-6 (13 Kasım - SCC Dosyalama & Bütçe)
todo_updates = {
    "IUS-7": {
        "title": "Resmi Yönetim Kurulu Kadrosu",
        "dueDate": "2026-10-10",
        "priority": 1,
        "sortOrder": -8000.0,
        "assigneeId": bekir_id
    },
    "IUS-5": {
        "title": "FENS Akademik Danışman Resmi Daveti ve Onayı",
        "dueDate": "2026-10-19",
        "priority": 1,
        "sortOrder": -7000.0,
        "assigneeId": hasan_id
    },
    "IUS-8": {
        "title": "🤫 SCC 10 Öğrenci Kuralı: Birebir İletişimle 6 Kişi Bulma",
        "dueDate": "2026-10-31",
        "priority": 1,
        "sortOrder": -6000.0,
        "assigneeId": mahmut_id
    },
    "IUS-6": {
        "title": "SCC Yıllık Faaliyet Planı ve Taslak Bütçe Dosyalaması",
        "dueDate": "2026-11-13",
        "priority": 1,
        "sortOrder": -5000.0,
        "assigneeId": hasan_id
    }
}

# 2. BACKLOG ISSUES (Onay Sonrası / Faaliyet Takvimi)
# Sıra:
# IUS-9:  2026-12-04 (Aralık 1. Hafta) - Promotion Day: Kampüs Standı & Lansman
# IUS-10: 2026-12-11 (Aralık 2. Hafta) - Haftalık Yapay Zeka & Prompt Atölyeleri
# IUS-11: 2026-12-18 (Aralık 3. Hafta) - Haftalık Online Tech-Talks (Google Meet)
# IUS-12: 2026-12-25 (Aralık 4. Hafta) - Aylık Kampüs Teknoloji Konuşmacıları
# IUS-13: 2027-04-16 (Bahar Dönemi)   - IUS Yıllık Kampüs Hackathonu (DevHack)

backlog_updates = {
    "IUS-9": {
        "title": "⏸️ [Aralık 1. Hafta] Promotion Day: Kampüs Standı ve Afiş Hazırlığı",
        "dueDate": "2026-12-04",
        "priority": 1,
        "sortOrder": -4000.0,
        "assigneeId": bekir_id
    },
    "IUS-10": {
        "title": "🤖 [Aralık 2. Hafta] Haftalık Yapay Zeka & Prompt Atölyeleri: Müfredat ve Eğitmen Ağı",
        "dueDate": "2026-12-11",
        "priority": 2,
        "sortOrder": -3000.0,
        "assigneeId": hasan_id
    },
    "IUS-11": {
        "title": "🌐 [Aralık 3. Hafta] Haftalık Online Tech-Talks (Google Meet): Format ve Konuk Daveti",
        "dueDate": "2026-12-18",
        "priority": 2,
        "sortOrder": -2000.0,
        "assigneeId": hasan_id,
        "description": """### 🎯 Faaliyet Amacı:
Her hafta tanınmış, sektörde deneyimli yerli ve yabancı teknoloji uzmanları ile Google Meet webinar formatında samimi, interaktif online söyleşi (fireside chat) ve mentorluk seansları yapmak.

### 📋 Yapılacaklar:
- [ ] **Topluluk Platformu:** Google Meet webinar altyapısını, Q&A moderasyon kurallarını hazırlamak.
- [ ] **LinkedIn / X İletişim Stratejisi:** Yurt dışında ve Türkiye'de büyük teknoloji şirketlerinde (Google, Amazon, Trendyol vb.) çalışan yazılımcılara ulaşmak için samimi davet mesajı taslağı hazırlamak.
- [ ] **Format Belirleme:** Çarşamba veya Pazar akşamları 45 dakika konuk söyleşisi + 15 dakika soru-cevap.
- [ ] **Kayıt ve Arşiv:** Konuğun izniyle oturumların kaydedilip kulüp üyelerine özel paylaşılması.

🔗 **İlgili Resmi Belge:** [SCC Yıllık Faaliyet Planı](https://linear.app/ius-engineering-events/document/scc-yillik-faaliyet-plani-4-temel-sutun-and-devhack-20262027-db3b4f5e5a05)"""
    },
    "IUS-12": {
        "title": "🎙️ [Aralık 4. Hafta] Aylık Kampüs Teknoloji Konuşmacıları: Konuk Havuzu ve Salon",
        "dueDate": "2026-12-25",
        "priority": 3,
        "sortOrder": -1000.0,
        "assigneeId": mahmut_id,
        "description": """### 🎯 Faaliyet Amacı:
**Minimum ayda 1 kez** teknoloji alanında öncü bir ismi, yazılım mimarını veya şirket kurucusunu IUS kampüsüne davet edip amfide yüz yüze seminer ve networking düzenlemek.

### 📋 Yapılacaklar:
- [ ] **Potansiyel Şirket & Konuk Listesi:** Sarajevo'daki teknoloji firmalarından (Bit Alliance ekosistemi, Symphony, Klika, Zira, Endava vb.) konuşmacı olabilecek 5-6 isim belirlemek.
- [ ] **Salon Prosedürü:** SCC üzerinden FENS Ana Amfi rezervasyonunun etkinlikten en az 10 iş günü önce yapılması.
- [ ] **Etkinlik Akışı:** 40 dakika teknik / ilham verici sunum + 20 dakika soru-cevap + fuaye alanında ikram/kahve sohbeti.
- [ ] **Konuşmacı Davet Şablonu:** Resmi, profesyonel e-posta davet metninin hazırlanması.

🔗 **İlgili Resmi Belge:** [SCC Yıllık Faaliyet Planı](https://linear.app/ius-engineering-events/document/scc-yillik-faaliyet-plani-4-temel-sutun-and-devhack-20262027-db3b4f5e5a05)"""
    },
    "IUS-13": {
        "title": "⚡ [Bahar 2027 / Nisan] IUS Yıllık Kampüs Hackathonu (DevHack): Konsept ve Sponsorluk",
        "dueDate": "2027-04-16",
        "priority": 4,
        "sortOrder": 0.0,
        "assigneeId": bekir_id
    }
}

all_updates = {**todo_updates, **backlog_updates}

for ident, update_data in all_updates.items():
    iss = issue_by_id.get(ident)
    if not iss:
        continue
    res = graphql(mutation, {"id": iss["id"], "input": update_data})
    u = res.get("issueUpdate", {}).get("issue", {})
    print(f"[✓] {ident} Güncellendi: SortOrder={u.get('sortOrder')}, Priority={u.get('priority')}, Due={u.get('dueDate')}, Title={u.get('title')}")

print("\n[✓] Tüm Linear görevleri zaman ve öncelik sırasına göre 1-e-1 hizalandı.")
