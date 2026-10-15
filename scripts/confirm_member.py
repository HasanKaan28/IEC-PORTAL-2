#!/usr/bin/env python3
"""
Fast Confirmation Tracker for 10 Normal Members (First-Come, First-Served).
Excludes Management Board (Kaan Mete, Hasan Kaan, Mahmut İhsan, Bekir Enes, Bakir Bašić).
Tracks the 11 candidate students and fills the top 10 who confirm into Form F252 on Desktop.
"""

import os
import sys
import json
from pathlib import Path

# Fix Windows console UTF-8 output
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = WORKSPACE_ROOT / "data" / "confirmed_members.json"

CANDIDATES = [
    {"id": "250302196", "name": "Bilal Yusuf Şimşek", "email": "250302196@student.ius.edu.ba", "phone": "[PROTECTED]", "dept": "Computer Engineering", "year": "1", "lang": "TR"},
    {"id": "250302243", "name": "Nazlıcan Cebeci", "email": "250302243@student.ius.edu.ba", "phone": "[PROTECTED]", "dept": "CSE", "year": "1", "lang": "TR"},
    {"id": "250302247", "name": "Muhammed Emin Tiryaki", "email": "250302247@student.ius.edu.ba", "phone": "[PROTECTED]", "dept": "FENS", "year": "2", "lang": "TR"},
    {"id": "250302211", "name": "Emin Efe Duman", "email": "250302211@student.ius.edu.ba", "phone": "[PROTECTED]", "dept": "FENS", "year": "1", "lang": "TR"},
    {"id": "260302051", "name": "Ahmed Hadzimurati", "email": "260302051@student.ius.edu.ba", "phone": "[PROTECTED]", "dept": "SE", "year": "1", "lang": "BS"},
    {"id": "250302232", "name": "Ömer Arif Açıkel", "email": "250302232@student.ius.edu.ba", "phone": "[PROTECTED]", "dept": "FENS", "year": "1", "lang": "TR"},
    {"id": "250302162", "name": "Mert Çınar Atalay", "email": "250302162@student.ius.edu.ba", "phone": "[PROTECTED]", "dept": "FENS", "year": "1", "lang": "TR"},
    {"id": "240302180", "name": "Ferit Enes Seymenliler", "email": "240302180@student.ius.edu.ba", "phone": "[PROTECTED]", "dept": "FENS", "year": "2", "lang": "TR"},
    {"id": "240302179", "name": "Hüseyin Talha Seymenliler", "email": "240302179@student.ius.edu.ba", "phone": "[PROTECTED]", "dept": "FENS", "year": "2", "lang": "TR"},
    {"id": "240302169", "name": "Muhammed Efe Ural", "email": "240302169@student.ius.edu.ba", "phone": "[PROTECTED]", "dept": "FENS", "year": "2", "lang": "TR"},
    {"id": "250201110", "name": "Abdullah Uzun", "email": "250201110@student.ius.edu.ba", "phone": "[PROTECTED]", "dept": "FBA", "year": "1", "lang": "TR"},
    {"id": "240302254", "name": "Işıl Irmak Cihan", "email": "240302254@student.ius.edu.ba", "phone": "[PROTECTED]", "dept": "FENS", "year": "3", "lang": "TR"},
]

def load_data():
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"confirmed": []}

def save_data(data):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def list_status():
    data = load_data()
    confirmed = data.get("confirmed", [])
    confirmed_ids = [c["id"] for c in confirmed]
    
    print("=" * 70)
    print(f"📊 İMZA ONAY DURUMU: {len(confirmed)} / 10 Üye Onaylandı (İlk 10)")
    print("=" * 70)
    
    print("✅ ONAYLANANLAR (İlk 10'a Girenler):")
    if not confirmed:
        print("   (Henüz onaylanan üye yok)")
    for i, c in enumerate(confirmed, 1):
        print(f"   {i:2d}. {c['name']:<25} | {c['slot']:<20} | No: {c['id']}")
        
    print("\n⏳ YANIT BEKLENEN ADAYLAR (11 Öğrenci):")
    for i, cand in enumerate(CANDIDATES, 1):
        if cand["id"] in confirmed_ids:
            status = "✅ ONAYLANDI"
        else:
            status = "⏳ Mesaj Gönderildi / Bekleniyor"
        print(f"   [{i:2d}] {cand['name']:<25} | {cand['lang']} | {cand['phone']:<16} | {status}")
    print("=" * 70)

def confirm_student(identifier, slot="Salı 11:50"):
    data = load_data()
    confirmed = data.get("confirmed", [])
    
    # Match candidate by index (1-based) or substring
    target = None
    if identifier.isdigit() and 1 <= int(identifier) <= len(CANDIDATES):
        target = CANDIDATES[int(identifier) - 1]
    else:
        ident_lower = identifier.lower()
        for cand in CANDIDATES:
            if ident_lower in cand["name"].lower() or ident_lower in cand["id"]:
                target = cand
                break
                
    if not target:
        print(f"[!] Aday bulunamadı: {identifier}")
        return

    # Check if already confirmed
    for c in confirmed:
        if c["id"] == target["id"]:
            print(f"[!] {target['name']} zaten onaylanmış!")
            return

    if len(confirmed) >= 10:
        print(f"[!] İlk 10 üye kotası doldu! {target['name']} yedek havuzda bekletilecek.")
        return

    confirmed.append({
        "id": target["id"],
        "name": target["name"],
        "email": target["email"],
        "phone": target["phone"],
        "slot": slot
    })
    
    data["confirmed"] = confirmed
    save_data(data)
    print(f"[✓] ONAYLANDI ({len(confirmed)}/10): {target['name']} -> {slot}")

    # Synchronize DOCX on Desktop
    sys.path.insert(0, str(WORKSPACE_ROOT / "scripts"))
    import fill_docx_form
    fill_docx_form.fill_docx()
    print("[✓] Masaüstü IEC klasöründeki Form F252 otomatik güncellendi!")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "confirm":
        ident = sys.argv[2] if len(sys.argv) > 2 else "1"
        slot = sys.argv[3] if len(sys.argv) > 3 else "Salı 11:50"
        confirm_student(ident, slot)
    else:
        list_status()
