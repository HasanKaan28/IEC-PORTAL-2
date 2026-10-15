#!/usr/bin/env python3
"""
Set accurate chronological Due Dates on all Linear issues
aligned with the official IUS SCC Calendar (Deadline: 24 Nov 2026).
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

# Fix Windows console UTF-8 output
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from linear_ops import get_issues, update_issue

# Chronological dates aligned with SCC 2026 Calendar:
# Today: 2026-10-07
# SCC Deadline: 2026-11-24
# Promotion Day: ~2026-12-04
schedule = {
    "IUS-7": {
        "dueDate": "2026-10-10", # Bu Cumartesi: Yönetim kurulu teyidi
        "priority": 1
    },
    "IUS-5": {
        "dueDate": "2026-10-19", # Gelecek hafta: Danışman hocayla görüşme
        "priority": 1
    },
    "IUS-8": {
        "dueDate": "2026-10-31", # Ekim sonu: 10 kişilik üye listesi tamamlama
        "priority": 1
    },
    "IUS-6": {
        "dueDate": "2026-11-13", # 13 Kasım: SCC resmi dosya teslimi (24 Kasım'dan 11 gün önce güvenli teslimat!)
        "priority": 1
    },
    "IUS-9": {
        "dueDate": "2026-12-04", # Aralık başı: SCC Kulüp Tanıtım Günü Standı
        "priority": 2
    }
}

issues = get_issues()
for iss in issues:
    key = iss["identifier"]
    if key in schedule:
        update_issue(iss["id"], {
            "dueDate": schedule[key]["dueDate"],
            "priority": schedule[key]["priority"]
        })
        print(f"[✓] {key} Teslim Tarihi: {schedule[key]['dueDate']} olarak ayarlandı!")
