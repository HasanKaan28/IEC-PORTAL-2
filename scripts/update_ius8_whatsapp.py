#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import get_issues, update_issue

issues = get_issues()

desc_ius8_updated = """### 🎯 Görev Amacı:
SCC kuralı: "The club must be founded by at least 10 IUS students." Listeyi 4'ten 10'a çıkarmak ve yeni üyeleri WhatsApp grubuna toplamak.

### 🔗 Resmi Katılım & İletişim Linkleri:
* **WhatsApp Grubu:** https://chat.whatsapp.com/LKMpyfm7K5R3F0rXezcXXN
* **Google Kayıt Formu:** https://docs.google.com/spreadsheets/d/1pLeiQpBNSfDFPGa5IqLbSGoz0Z2Lm3Olu-mq3XZhzbQ/edit?usp=sharing

### 📋 Yapılması Gereken Adım Adım Liste:
- [ ] **Link Paylaşımı:** WhatsApp ve form linkini FENS'teki mühendislik sınıf gruplarına ve arkadaşlarımıza iletmek.
- [ ] **Hedef:** En az 6 yeni öğrencinin İsim, Öğrenci No, Bölüm ve Telefon bilgilerini toplamak.
- [ ] **Roster Güncelleme:** 'templates/SCC_FOUNDING_10_MEMBERS.md' tablosundaki 5-10 arası boşlukları bu öğrencilerle doldurmak.
- [ ] **İmza Toplama:** Başvuru günü bu 10 kişinin dilekçeye imzalarını almak."""

for iss in issues:
    if iss["identifier"] == "IUS-8":
        update_issue(iss["id"], {
            "description": desc_ius8_updated
        })
        print("[✓] IUS-8 içine resmi WhatsApp linki eklendi!")
