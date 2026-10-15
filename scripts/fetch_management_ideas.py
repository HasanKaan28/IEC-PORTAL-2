#!/usr/bin/env python3
"""
IUS Engineering Club — Yönetim Fikir & Proje Havuzu Senkronizasyonu
Fetches live brainstormed project & event ideas from the Management Google Form/Sheet,
summarizes them, and prepares them for Linear and Observatory synchronization.
"""

import sys
import csv
import json
import urllib.request
from pathlib import Path
from datetime import datetime

# Windows console UTF-8 fix
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = WORKSPACE_ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

SHEET_ID = "1r9aVO0WNHy4AtvIQu1rExEB9X1of1KBOU5ErUTf0jFw"
CSV_EXPORT_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv"

CSV_OUTPUT = DATA_DIR / "management_ideas.csv"
JSON_OUTPUT = DATA_DIR / "management_ideas.json"

def fetch_ideas():
    print(f"[*] 📡 Canlı Yönetim Fikir Havuzu E-Tablosu taranıyor...")
    req = urllib.request.Request(CSV_EXPORT_URL, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read()
    except Exception as e:
        print(f"[!] Hata: E-Tabloya erişilemedi: {e}")
        return []

    with open(CSV_OUTPUT, "wb") as f:
        f.write(content)
        
    # Parse CSV
    with open(CSV_OUTPUT, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        try:
            headers = next(reader)
        except StopIteration:
            print("[!] E-Tablo henüz boş.")
            return []
            
        rows = list(reader)

    ideas = []
    for idx, r in enumerate(rows, 1):
        if not r or len(r) < 3 or not r[2].strip():
            continue
        idea = {
            "id": idx,
            "timestamp": r[0] if len(r) > 0 else "",
            "author": r[1] if len(r) > 1 else "",
            "title": r[2] if len(r) > 2 else "",
            "category": r[3] if len(r) > 3 else "",
            "problem_solution": r[4] if len(r) > 4 else "",
            "description": r[5] if len(r) > 5 else "",
            "target_audience": r[6] if len(r) > 6 else "",
            "budget": r[7] if len(r) > 7 else "",
            "difficulty": r[8] if len(r) > 8 else "",
            "ownership": r[9] if len(r) > 9 else "",
            "first_step": r[10] if len(r) > 10 else "",
            "links": r[11] if len(r) > 11 else ""
        }
        ideas.append(idea)

    with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(ideas, f, ensure_ascii=False, indent=2)

    print(f"[✓] {len(ideas)} adet fikir başarıyla çekildi ve arşivlendi.")
    print("=" * 60)
    print("💡 IUS ENGINEERING CLUB — YÖNETİM FİKİR & PROJE HAVUZU")
    print("=" * 60)
    
    if not ideas:
        print("ℹ️ Henüz form üzerinden gönderilmiş yeni bir fikir bulunmuyor.")
        print("   Ekip form linkini doldurduğunda burada tüm detayları görebileceğiz!")
    else:
        for idea in ideas:
            print(f"\n📌 #{idea['id']} {idea['title']}")
            print(f"   👤 Öneren: {idea['author']} | 🕒 {idea['timestamp']}")
            print(f"   🏷️ Alan: {idea['category']}")
            print(f"   🎯 Hedef Kitle: {idea['target_audience']} | 💰 Bütçe: {idea['budget']}")
            print(f"   ⚙️ Zorluk: {idea['difficulty']}/5 | 🙋 Sorumlu: {idea['ownership']}")
            print(f"   ❓ Neden & Problem: {idea['problem_solution']}")
            print(f"   📝 İşleyiş: {idea['description']}")
            if idea['first_step']:
                print(f"   🚀 İlk Adım: {idea['first_step']}")
            if idea['links']:
                print(f"   🔗 Ek Linkler: {idea['links']}")
            print("-" * 50)
            
    return ideas

if __name__ == "__main__":
    fetch_ideas()
