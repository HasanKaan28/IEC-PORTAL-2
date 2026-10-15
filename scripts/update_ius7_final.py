#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import get_issues, update_issue

issues = get_issues()

desc_ius7 = """### 🎯 Resmi Yönetim Kurulu Kadrosu (Onaylandı):
SCC 2. sınıf kuralını sağlayan ve fiili liderliği Kaptan'da tutan resmi kadro netleşmiştir.

### 👥 Kesinleşen Rol Dağılımı:
* **👑 Club President (Resmi Başkan):** **Kaan Mete Şenyıldız** *(2. Sınıf, Öğr No: 250302201 - SCC şartını sağlar)*
* **⚡ Vice President & Founder (Fiili Kaptan):** **Hasan Kaan** *(Tüm kulübün kurucusu, strateji ve operasyon lideri)*
* **📋 General Secretary (Genel Sekreter):** **Mahmut İhsan Avcı** *(Öğr No: 250302233 - Resmi evraklar, dilekçeler ve kayıtlar)*
* **💰 Treasurer & Finance (Sayman / Mali İşler):** **Bekir Enes Çokbekler** *(Öğr No: 250302229 - Bütçe, sponsorluk ve harcamalar)*

### 📋 Yapılması Gerekenler:
- [x] Rol dağılımının kesinleştirilmesi.
- [ ] 'templates/SCC_FOUNDING_10_MEMBERS.md' ve başvuru dilekçesine bu isimlerin resmi olarak işlenmesi.
- [ ] Kaan Mete Şenyıldız'ın Linear davetini kabul etmesi ve yönetim kurulunun toplanması."""

for iss in issues:
    if iss["identifier"] == "IUS-7":
        update_issue(iss["id"], {
            "title": "Resmi Yönetim Kurulu Kadrosu (Kaan Mete, Hasan, Mahmut, Bekir)",
            "description": desc_ius7
        })
        print("[✓] IUS-7 başarıyla güncellendi!")
