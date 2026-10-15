#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import get_issues, update_issue

issues = get_issues()

desc_ius8_updated = """### 🎯 Görev Amacı:
SCC kuralı: "The club must be founded by at least 10 IUS students." Listeyi 4'ten 10'a çıkarmak ve yeni yönetim/kurucu adaylarını kaydetmek.

### 🔗 Resmi Paylaşım Linkleri (Kopyala-Yapıştır):
* 📝 **Yönetim Ekibi Başvuru Formu:** https://forms.gle/v8c85MgFUmVvpzTH6
* 💬 **Resmi WhatsApp Grubu:** https://chat.whatsapp.com/LKMpyfm7K5R3F0rXezcXXN
* 📊 **Gelen Yanıtlar Tablosu:** https://docs.google.com/spreadsheets/d/1pLeiQpBNSfDFPGa5IqLbSGoz0Z2Lm3Olu-mq3XZhzbQ/edit?usp=sharing

### 📋 Yapılması Gereken Adım Adım Liste:
- [ ] **Mesajı Yayma:** FENS mühendislik sınıf gruplarına form ve WhatsApp linkini iletmek.
- [ ] **Takip:** Form dolduran ilk 6 öğrencinin bilgilerini teyit etmek.
- [ ] **Belgeye İşleme:** 'templates/SCC_FOUNDING_10_MEMBERS.md' dosyasındaki 5-10 arası satırları bu öğrencilerle doldurmak.
- [ ] **İmza:** Başvuru günü bu 10 kişinin ıslak imzalarını toplamak."""

for iss in issues:
    if iss["identifier"] == "IUS-8":
        update_issue(iss["id"], {
            "description": desc_ius8_updated
        })
        print("[✓] IUS-8 içine canlı Google Form linki eklendi!")
