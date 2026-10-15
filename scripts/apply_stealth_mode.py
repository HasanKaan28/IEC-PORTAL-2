#!/usr/bin/env python3
"""
Implement Stealth Mode Strategy in Linear:
1. Move IUS-9 (Promotion & Public Launch) back to Backlog (On Hold until SCC approval).
2. Update IUS-8 to emphasize quiet 1-on-1 personal outreach (no public broadcasting).
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import graphql, get_issues, update_issue

# Get Backlog state ID
q = """
query {
  teams {
    nodes {
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
backlog_state_id = None
for s in res["teams"]["nodes"][0]["states"]["nodes"]:
    if s["name"].lower() == "backlog" or s["type"].lower() == "backlog":
        backlog_state_id = s["id"]
        break

# 1. Update IUS-9 -> Backlog & On Hold
desc_ius9_hold = """### 🛑 DURUM: BEKLEMEDE (ONAY SONRASINA ERTELENDİ)
⚠️ **Kural:** IUS SCC resmi kulüp onayı çıkana kadar kampüste veya sosyal medyada **kamuya açık hiçbir paylaşım yapılmayacaktır**.

### 🎯 Görev Amacı:
Kulüp resmiyet kazandıktan sonra (Kasım sonu / Aralık başı) yapılacak "Student Club Promotion Day" ve resmi lansman hazırlıkları.

### 📋 Resmi Onay Sonrası Yapılacaklar:
- [ ] Onay belgesi alındıktan sonra Instagram ve LinkedIn hesaplarının aktifleştirilmesi.
- [ ] Kampüs stant günü için afiş, roll-up ve broşürlerin hazırlanması.
- [ ] Canlı demo projelerin sergilenmesi."""

# 2. Update IUS-8 -> Stealth Mode (Birebir İletişim)
desc_ius8_stealth = """### 🤫 STRATEJİ: STEALTH MODE (SESSİZ VE BİREBİR)
⚠️ **Önemli Kural:** Genel ve kalabalık sınıf gruplarına duyuru atılmayacak! Üniversite resmi onayı öncesi dikkat çekmemek için **sadece birebir (DM veya yüz yüze)** güvendiğimiz arkadaşlarımıza ulaşılarak 10 kişi tamamlanacaktır.

### 🔗 Paylaşım Linkleri (Yalnızca Özelden Atılacak):
* 📝 **Yönetim/Kurucu Kayıt Formu:** https://forms.gle/v8c85MgFUmVvpzTH6
* 💬 **WhatsApp Grubu:** https://chat.whatsapp.com/LKMpyfm7K5R3F0rXezcXXN

### 📋 Eylem Planı:
- [ ] **Birebir İletişim:** FENS'ten güvendiğimiz 6 arkadaşımıza özelden yazıp form linkini iletmek:
  *(Örn: "Dostum IUS'ta resmi bir mühendislik kulübü kuruyoruz, başvuru için kurucu listemize seni de ekliyoruz, formu doldurur musun?")*
- [ ] **10 Kişiye Ulaşma:** Formdaki öğrenci numaralarını 'templates/SCC_FOUNDING_10_MEMBERS.md' dosyasına eklemek.
- [ ] **İmza:** Evrak teslim günü bu 10 arkadaştan imzaları toplamak."""

issues = get_issues()
for iss in issues:
    if iss["identifier"] == "IUS-9":
        payload = {
            "title": "⏸️ [ONAY SONRASI] Promotion Day: Kampüs Standı ve Afiş Hazırlığı",
            "description": desc_ius9_hold
        }
        if backlog_state_id:
            payload["stateId"] = backlog_state_id
        update_issue(iss["id"], payload)
        print("[✓] IUS-9 Backlog'a çekildi ve donduruldu!")

    if iss["identifier"] == "IUS-8":
        update_issue(iss["id"], {
            "title": "🤫 SCC 10 Öğrenci Kuralı: Birebir İletişimle 6 Kişi Bulma",
            "description": desc_ius8_stealth
        })
        print("[✓] IUS-8 Stealth Mode (sessiz birebir) olarak güncellendi!")
