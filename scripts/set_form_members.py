#!/usr/bin/env python3
"""
Dynamic Member Selection Tool for student_club_registration_form_f252.docx
Allows selecting the 10 students who will be physically present on campus to sign.
"""

import os
import sys
import json
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import fill_docx_form

ALL_APPLICANTS = [
    # Core Board
    {"name": "Kaan Mete Şenyıldız", "email": "kmsenyildiz@student.ius.edu.ba", "id": "250302201", "role": "President", "lang": "TR", "phone": "[PROTECTED]"},
    {"name": "Hasan Kaan Karabulut", "email": "hasankaankarabulut@student.ius.edu.ba", "id": "250302195", "role": "Vice President", "lang": "TR", "phone": "[PROTECTED]"},
    {"name": "Mahmut İhsan Avcı", "email": "mahmut.ihsanavcii@student.ius.edu.ba", "id": "250302233", "role": "Secretary", "lang": "TR", "phone": "[PROTECTED]"},
    {"name": "Bekir Enes Çokbekler", "email": "becokbekler@student.ius.edu.ba", "id": "250302229", "role": "Treasurer", "lang": "TR", "phone": "[PROTECTED]"},
    {"name": "Bakir Bašić", "email": "260302030@student.ius.edu.ba", "id": "260302030", "role": "PR & Media Lead", "lang": "BS", "phone": "[PROTECTED]"},
    
    # Active Applicants / Members
    {"name": "Bilal Yusuf Şimşek", "email": "250302196@student.ius.edu.ba", "id": "250302196", "role": "Member", "lang": "TR", "phone": "[PROTECTED]"},
    {"name": "Nazlıcan Cebeci", "email": "250302243@student.ius.edu.ba", "id": "250302243", "role": "Member", "lang": "TR", "phone": "[PROTECTED]"},
    {"name": "Muhammed Emin Tiryaki", "email": "250302247@student.ius.edu.ba", "id": "250302247", "role": "Member", "lang": "TR", "phone": "[PROTECTED]"},
    {"name": "Emin Efe Duman", "email": "250302211@student.ius.edu.ba", "id": "250302211", "role": "Member", "lang": "TR", "phone": "[PROTECTED]"},
    {"name": "Ahmed Hadzimurati", "email": "260302051@student.ius.edu.ba", "id": "260302051", "role": "Member", "lang": "BS", "phone": "[PROTECTED]"},
    
    # Reserve / Alternate Pool
    {"name": "Ömer Arif Açıkel", "email": "250302232@student.ius.edu.ba", "id": "250302232", "role": "Member (Reserve)", "lang": "TR", "phone": "[PROTECTED]"},
    {"name": "Mert Çınar Atalay", "email": "250302162@student.ius.edu.ba", "id": "250302162", "role": "Member (Reserve)", "lang": "TR", "phone": "[PROTECTED]"},
    {"name": "Ferit Enes Seymenliler", "email": "240302180@student.ius.edu.ba", "id": "240302180", "role": "Member (Reserve)", "lang": "TR", "phone": "[PROTECTED]"},
    {"name": "Hüseyin Talha Seymenliler", "email": "240302179@student.ius.edu.ba", "id": "240302179", "role": "Member (Reserve)", "lang": "TR", "phone": "[PROTECTED]"},
    {"name": "Muhammed Efe Ural", "email": "240302169@student.ius.edu.ba", "id": "240302169", "role": "Member (Reserve)", "lang": "TR", "phone": "[PROTECTED]"},
    {"name": "Abdullah Uzun", "email": "250201110@student.ius.edu.ba", "id": "250201110", "role": "Member (Reserve)", "lang": "TR", "phone": "[PROTECTED]"},
    {"name": "Işıl Irmak Cihan", "email": "240302254@student.ius.edu.ba", "id": "240302254", "role": "Member (Reserve)", "lang": "TR", "phone": "[PROTECTED]"},
]

def list_roster():
    print("=" * 65)
    print("📋 TÜM ADAYLAR VE İMZA HAVUZU (17 KİŞİ)")
    print("=" * 65)
    for i, a in enumerate(ALL_APPLICANTS, 1):
        status = "✅ ASİL (İlk 10)" if i <= 10 else "⏳ YEDEK HAVUZ"
        print(f"[{i:2d}] {a['name']:<25} | {a['lang']} | {a['phone']:<16} | {status}")
    print("=" * 65)

if __name__ == "__main__":
    list_roster()
