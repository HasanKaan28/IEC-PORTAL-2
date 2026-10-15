#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from linear_ops import get_issues, update_issue

issues = get_issues()

desc_ius7 = """### 🎯 Resmi Yönetim Kurulu Kadrosu:
SCC gereksinimlerine uygun resmi yönetim kurulu belirlenmiştir.

### 👥 Rol Dağılımı:
* **Club President (Başkan):** Kaan Mete Şenyıldız (2. Sınıf, Öğr No: 250302201)
* **Vice President (Başkan Yardımcısı):** Hasan Kaan (Öğr No: 250302195)
* **General Secretary (Genel Sekreter):** Mahmut İhsan Avcı (1. Sınıf, Öğr No: 250302233)
* **Treasurer (Sayman / Mali İşler):** Bekir Enes Çokbekler (1. Sınıf, Öğr No: 250302229)

### 📋 Yapılması Gerekenler:
- [x] Rol dağılımının netleştirilmesi.
- [x] Resmi başvuru belgelerine öğrenci numaralarının işlenmesi.
- [ ] Kaan Mete Şenyıldız'ın daveti onaylaması ve ilk yönetim kurulu toplantısı."""

for iss in issues:
    if iss["identifier"] == "IUS-7":
        update_issue(iss["id"], {
            "title": "Resmi Yönetim Kurulu Kadrosu",
            "description": desc_ius7
        })
        print("[✓] IUS-7 sade ve resmi dille güncellendi!")
