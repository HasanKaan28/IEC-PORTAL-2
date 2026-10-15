#!/usr/bin/env python3
"""
Move all IEC issues to Todo (Active) state and update detailed checklists.
"""

import sys
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

# Fix Windows console UTF-8 output
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from linear_ops import graphql, get_issues, update_issue

# 1. Get Team States
q = """
query {
  teams {
    nodes {
      id
      states {
        nodes {
          id
          name
          type
        }
      }
    }
  }
}
"""
res = graphql(q)
teams = res.get("teams", {}).get("nodes", [])
todo_state_id = None
if teams:
    for s in teams[0]["states"]["nodes"]:
        if s["name"].lower() == "todo" or s["type"].lower() == "unstarted":
            todo_state_id = s["id"]
            print(f"[+] 'Todo' Durumu Bulundu: {s['name']} (ID: {s['id']})")
            break

# 2. Rich Descriptions
desc_ius7 = """### 🎯 Görev Amacı:
2. sınıf öğrencisi bulunduğu için resmi SCC Yönetim Kurulu kadrosunu resmileştirmek ve ekiple teyit etmek.

### 📋 Yapılması Gereken Adım Adım Liste:
- [ ] **Bilgi Temini:** Bulunan 2. sınıf arkadaşımızın resmi bilgilerini (Tam Adı, Öğrenci No, Bölüm, Telefon, E-posta) almak.
- [ ] **Resmi Dilekçe Eşleşmesi:**
  * **Club President (Resmi Başkan):** Bulunan 2. sınıf öğrencisi *(SCC kuralını sağlar)*.
  * **Vice President & Founder (Kaptan):** Hasan Kaan *(Operasyon ve strateji lideri)*.
  * **General Secretary (Genel Sekreter):** Bekir Enes Çokbekler.
  * **Treasurer & Finance (Sayman / Mali İşler):** Mahmut İhsan Avcı.
  * **Board Member (Yönetim Kurulu):** Kaan Mete Şenyıldız.
- [ ] **Hızlı Senkronizasyon (15 dk):** Ekiple buluşup rolleri ve hedefleri teyit etmek.
- [ ] **Doküman Güncellemesi:** 'templates/SCC_FOUNDING_10_MEMBERS.md' dosyasına bilgileri işlemek."""

desc_ius5 = """### 🎯 Görev Amacı:
Kulübün arkasında duracak, FENS fakültesinden bir profesörü (Advisor) resmi olarak bağlamak.

### 📋 Yapılması Gereken Adım Adım Liste:
- [ ] **Hoca Listesi:** FENS bünyesindeki (CS, SE, EE veya ME) öğrenci dostu 1-2 hocayı belirlemek.
- [ ] **Resmi Davet:** 'templates/ACADEMIC_ADVISOR_INVITATION.md' mektubunu hocanın adına göre düzenleyip e-posta göndermek veya odasını ziyaret etmek.
- [ ] **Sunum (3 Dakika):** Hocaya kısaca vizyonu aktarmak: *"Hocam biz IUS'ta aktif atölyeler ve hackathonlar düzenleyecek Engineering Events kulübünü kuruyoruz, danışman hocamız olmanız bizi onurlandırır."*
- [ ] **İmza:** Hoca kabul ettiğinde SCC Başvuru Formundaki Advisor onay imzasını almak."""

desc_ius6 = """### 🎯 Görev Amacı:
SCC'nin istediği faaliyet planı ve tahmini bütçe evraklarını eksiksiz hazır hale getirmek.

### 📋 Yapılması Gereken Adım Adım Liste:
- [ ] **Faaliyet Planı İnceleme:** 'templates/SCC_ANNUAL_ACTIVITY_PLAN.md' dosyasındaki Güz ve Bahar dönemi etkinliklerini incelemek (Lansman, AI Lab, IoT Lab, DevHack 2026).
- [ ] **Taslak Bütçe İnceleme:** 'templates/SCC_DRAFT_BUDGET.md' dosyasındaki 5.000 KM dengeli bütçeyi kontrol etmek (Gelir: Şirket sponsorlukları / Gider: Afiş, pizza, ikram, ödüller).
- [ ] **Çıktı Alma:** Başvuru haftasında bu iki belgenin çıktısını alıp başvuru klasörüne eklemek."""

desc_ius8 = """### 🎯 Görev Amacı:
SCC kuralı: 'The club must be founded by at least 10 IUS students.' Listeyi 4'ten 10'a çıkarmak.

### 📋 Yapılması Gereken Adım Adım Liste:
- [ ] **Form Dağıtımı:** Google Form kayıt linkini FENS'teki mühendislik sınıf gruplarına ve arkadaşlarımıza iletmek.
- [ ] **Hedef:** En az 6 yeni öğrencinin İsim, Öğrenci No, Bölüm ve Telefon bilgilerini toplamak.
- [ ] **Roster Güncelleme:** 'templates/SCC_FOUNDING_10_MEMBERS.md' tablosundaki 5-10 arası boşlukları bu öğrencilerle doldurmak.
- [ ] **İmza Toplama:** Başvuru günü bu 10 kişinin dilekçeye imzalarını almak."""

desc_ius9 = """### 🎯 Görev Amacı:
24 Kasım başvuru sonrasındaki 2 hafta içinde yapılacak 'Student Club Promotion Day' için hazırlık.

### 📋 Yapılması Gereken Adım Adım Liste:
- [ ] **Sosyal Medya & Tasarım:** 'pr_and_branding/SOCIAL_MEDIA_LAUNCH_KIT.md' üzerinden Instagram ve LinkedIn sayfalarını canlandırmak.
- [ ] **Stant Materyalleri:** Kampüs girişine koymak için 1 adet roll-up banner ve masaya koyulacak kulüp broşürü tasarlamak.
- [ ] **QR Kodlu Katılım:** Stanta gelen öğrencilerin telefonla okutup anında kulübe/WhatsApp grubuna katılabileceği QR kod oluşturmak.
- [ ] **Canlı Demo:** Stantta ilgi çekecek küçük bir donanım/kod demosu hazırlamak."""

updates = {
    "IUS-7": {"title": "Resmi Yönetim Kurulu Kadrosu (2. Sınıf Başkan Çözümü)", "desc": desc_ius7},
    "IUS-5": {"title": "FENS Akademik Danışman Resmi Daveti ve Onayı", "desc": desc_ius5},
    "IUS-6": {"title": "SCC Yıllık Faaliyet Planı ve Taslak Bütçe Dosyalaması", "desc": desc_ius6},
    "IUS-8": {"title": "SCC 10 Öğrenci Kuralı: Kalan 6 Kurucu Üyeyi Tamamlama", "desc": desc_ius8},
    "IUS-9": {"title": "Promotion Day: Kampüs Standı, Afiş ve QR Kod Hazırlığı", "desc": desc_ius9}
}

issues = get_issues()
for iss in issues:
    key = iss["identifier"]
    if key in updates:
        payload = {
            "title": updates[key]["title"],
            "description": updates[key]["desc"]
        }
        if todo_state_id:
            payload["stateId"] = todo_state_id
        update_issue(iss["id"], payload)
        print(f"[✓] {key} -> AKTİF (Todo) yapıldı ve detaylar işlendi!")
