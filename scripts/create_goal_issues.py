#!/usr/bin/env python3
"""
Create structured Linear issues for the 4 core pillars:
1. Weekly AI & Prompt Workshops (IUS-10)
2. Monthly Campus Tech Speakers (IUS-11)
3. Weekly Online Tech-Talks (IUS-12)
4. Annual Campus Hackathon DevHack (IUS-13)
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

existing_issues = get_issues()
team_id = existing_issues[0]["team"]["id"]

backlog_state_id = "c74022fe-04b5-4b6a-a6fd-548d2046f2d8"

mutation = """
mutation CreateIssue($input: IssueCreateInput!) {
  issueCreate(input: $input) {
    success
    issue {
      id
      identifier
      title
      url
      state { name }
      assignee { name }
    }
  }
}
"""

issues_to_create = [
    {
        "title": "🤖 Haftalık Yapay Zeka & Prompt Atölyeleri: Müfredat ve Gönüllü Eğitmen Ağı",
        "assigneeId": hasan_id,
        "priority": 2,
        "description": """### 🎯 Faaliyet Amacı:
Öğrencilere pratik yapay zeka kullanımı, prompt mühendisliği ve modern AI araçları (Cursor, Claude, Copilot) üzerine **her hafta düzenli atölye** sunmak. Taze bir kulüp yapısı olduğumuz için süreci sürdürülebilir kılmak adına akran eğitimi ve gönüllü eğitmen modeli kurulacaktır.

### 📋 Yapılacaklar:
- [ ] **1. Hafta Atölye Taslağı:** "Prompt Mühendisliği 101" (System promptlar, rol verme, bağlam yönetimi, halüsinasyonu engelleme).
- [ ] **2. Hafta Atölye Taslağı:** "AI Destekli Kodlama & Prototipleme" (Cursor & Copilot ile sıfırdan proje geliştirme).
- [ ] **Gönüllü Eğitmen Çağrısı:** FENS'teki 2., 3. ve 4. sınıf bilgili öğrencilerden atölye vermek isteyen gönüllüler için kısa başvuru formu oluşturulması.
- [ ] **Format Kararı:** Haftalık 1 saat uygulamalı lab (FENS Lab B.30 veya amfi) + ekran yansıtmalı canlı pratik.

🔗 **İlgili Resmi Belge:** [SCC Yıllık Faaliyet Planı](https://linear.app/ius-engineering-events/document/scc-yillik-faaliyet-plani-4-temel-sutun-and-devhack-20262027-db3b4f5e5a05)"""
    },
    {
        "title": "🎙️ Aylık Kampüs Teknoloji Konuşmacıları: Konuk Havuzu ve Salon Planlaması",
        "assigneeId": mahmut_id,
        "priority": 2,
        "description": """### 🎯 Faaliyet Amacı:
**Minimum ayda 1 kez** teknoloji alanında öncü bir ismi, yazılım mimarını veya şirket kurucusunu IUS kampüsüne davet edip amfide yüz yüze seminer ve networking düzenlemek.

### 📋 Yapılacaklar:
- [ ] **Potansiyel Şirket & Konuk Listesi:** Sarajevo'daki teknoloji firmalarından (Bit Alliance ekosistemi, Symphony, Klika, Zira, Endava vb.) konuşmacı olabilecek 5-6 isim belirlemek.
- [ ] **Salon Prosedürü:** SCC üzerinden FENS Ana Amfi rezervasyonunun etkinlikten en az 10 iş günü önce yapılması.
- [ ] **Etkinlik Akışı:** 40 dakika teknik / ilham verici sunum + 20 dakika soru-cevap + fuaye alanında ikram/kahve sohbeti.
- [ ] **Konuşmacı Davet Şablonu:** Resmi, profesyonel e-posta davet metninin hazırlanması.

🔗 **İlgili Resmi Belge:** [SCC Yıllık Faaliyet Planı](https://linear.app/ius-engineering-events/document/scc-yillik-faaliyet-plani-4-temel-sutun-and-devhack-20262027-db3b4f5e5a05)"""
    },
    {
        "title": "🌐 Haftalık Online Tech-Talks (Google Meet): Format ve Konuk Davet Şablonu",
        "assigneeId": hasan_id,
        "priority": 3,
        "description": """### 🎯 Faaliyet Amacı:
Her hafta tanınmış, sektörde deneyimli yerli ve yabancı teknoloji uzmanları ile Google Meet webinar formatında samimi, interaktif online söyleşi (fireside chat) ve mentorluk seansları yapmak.

### 📋 Yapılacaklar:
- [ ] **Topluluk Platformu:** Google Meet webinar altyapısını, Q&A moderasyon kurallarını hazırlamak.
- [ ] **LinkedIn / X İletişim Stratejisi:** Yurt dışında ve Türkiye'de büyük teknoloji şirketlerinde (Google, Amazon, Trendyol vb.) çalışan yazılımcılara ulaşmak için samimi davet mesajı taslağı hazırlamak.
- [ ] **Format Belirleme:** Çarşamba veya Pazar akşamları 45 dakika konuk söyleşisi + 15 dakika soru-cevap.
- [ ] **Kayıt ve Arşiv:** Konuğun izniyle oturumların kaydedilip kulüp üyelerine özel paylaşılması.

🔗 **İlgili Resmi Belge:** [SCC Yıllık Faaliyet Planı](https://linear.app/ius-engineering-events/document/scc-yillik-faaliyet-plani-4-temel-sutun-and-devhack-20262027-db3b4f5e5a05)"""
    },
    {
        "title": "⚡ IUS Yıllık Kampüs Hackathonu (DevHack): Konsept, İzinler ve Sponsorluk",
        "assigneeId": bekir_id,
        "priority": 2,
        "description": """### 🎯 Faaliyet Amacı:
Bu yıl içinde IUS kampüsünde gerçekleştireceğimiz **24 saatlik büyük yazılım ve mühendislik hackathonunu (IUS DevHack)** planlamak.

### 📋 Yapılacaklar:
- [ ] **Hedef Dönem Belirleme:** Bahar 2027 (Nisan 2. haftası - vize sonrası, finaller öncesi ideal zaman).
- [ ] **Gece Kalma & Kampüs İzinleri:** FENS Dekanlığı, SCC ve Kampüs Güvenliği ile 24 saatlik bina kullanımı için ön görüşme protokolü.
- [ ] **Şirket Sponsorluk Dosyası (Taslak Bütçe):** Ödül havuzu, katılımcılara tişört/sticker, 24 saatlik pizza/yiyecek ve Redbull/kahve ikramı için şirket sponsorluk paketleri hazırlamak.
- [ ] **Problem Havuzu ve Mentorlar:** Katılımcı takımlara verilecek gerçek dünya mühendislik problemleri ve sektörden mentor/jüri listesi.

🔗 **İlgili Resmi Belge:** [SCC Taslak Yıllık Bütçe Tahmini (5.000 KM)](https://linear.app/ius-engineering-events/document/scc-taslak-yillik-butce-tahmini-5000-km-127e6ed0a921)"""
    }
]

for item in issues_to_create:
    inp = {
        "teamId": team_id,
        "title": item["title"],
        "description": item["description"],
        "assigneeId": item["assigneeId"],
        "priority": item["priority"],
        "stateId": backlog_state_id
    }
    res = graphql(mutation, {"input": inp})
    iss = res.get("issueCreate", {}).get("issue", {})
    print(f"[✓] Linear Görevi Oluşturuldu: [{iss.get('identifier')}] {iss.get('title')} -> {iss.get('url')}")
